const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')
const caller = require('caller')
const readFileAsync = Promise.promisify(fs.readFile)

const classCommentRegexp = /((\/\/.*)|(\/\*(?:[\s\S](?!\*\/))*?\s*\*\/))+\s*(constructor\s*\()/
const annotationRegexp = /@([a-zA-Z_][a-zA-Z0-9]*)\((.*)\)/g

module.exports = {

	parse: function(filePath) {
		let absolutePath = path.resolve(path.dirname(caller()), filePath)
		return readFileAsync(absolutePath, {encoding: 'utf-8'}).then((fileContent) => {
			return this.parseFileAnnotations(absolutePath, fileContent)
		})
	},

	parseFileAnnotations: function(absolutePath, fileContent) {
		let exported = require(absolutePath)
		let result = []

		// module can be exported as function
		if (exported instanceof Function) {
			let annotations = null
			let content = exported.toString()
			if (content.indexOf('construct') > 0) {
				annotations = this.parseClassAnnotations(fileContent, null, exported, content)
			} else {
				annotations = this.parseModuleAnnotations(fileContent)
			}
			if (annotations) {
				result.push({
					ref: exported,
					name: path.basename(absolutePath, path.extname(absolutePath)),
					annotations: annotations
				})
			}
		}

		// module can export many functions
		for (let name in exported) {
			if (exported[name] instanceof Function) {
				let annotations = this.parseModuleDefinitionAnnotations(fileContent, name, exported[name])
				if (annotations) {
					result.push({
						ref: exported[name],
						name: name,
						annotations: annotations
					})
				}
			}
		}

		return result
	},

	parseModuleAnnotations: function(fileContent) {
		let query = [
			'module\\.exports\\s*=\\s*(:?function\\s*\\([\\S\\s]*?\\))?\\s*{'
		]

		let matchesComment = this.createCommentRegexp(query).exec(fileContent)
		//console.log("\n\n", fileContent, matchesComment, this.createCommentRegexp(query))
		if (!matchesComment) {
			return null
		}

		return this.parseCommentAnnotations(matchesComment[0])
	},

	parseModuleDefinitionAnnotations: function(fileContent, property, definition) {
		let content = definition.toString()
		if (content.indexOf('construct') > 0) {
			return this.parseClassAnnotations(fileContent, property, definition, content)
		} else {
			return this.parseFunctionAnnotations(fileContent, property, definition, content)
		}
	},

	parseFunctionAnnotations: function(fileContent, property, definition, content) {
		let query = [
			property + '\\s*:\\s*function(\\s+\\S+)?\\s*\\(',
			'(module\\.)?exports\\.' + property + '\\s*=\\s*',
		]
		if (property === 'default') {
			query.push('\\s*export\\s+(default\\s+)?function\\s*\\(')
		}
		let matches = content.match(/function\s*([^(]+)?\s*\(/)
		if (matches && matches[1]) {
			query.push('\\s*(export\\s+(default\\s+)?)?function\\s+' + matches[1] + '\\s*\\(')
		}

		let matchesComment = this.createCommentRegexp(query).exec(fileContent)
		if (!matchesComment) {
			return null
		}

		return this.parseCommentAnnotations(matchesComment[0])
	},

	parseClassAnnotations: function(fileContent, property, definition, content) {
		let regexp = new RegExp('class\\s+' + definition.name)
		let matches = regexp.exec(fileContent)
		if (!matches) {
			return null
		}

		let matchesComment = classCommentRegexp.exec(content)
		if (!matchesComment) {
			return null
		}

		return this.parseCommentAnnotations(matchesComment[1])
	},

	parseCommentAnnotations: function(comment) {
		let matches, result = {}, hasAnnotation = false
		while (matches = annotationRegexp.exec(comment)) {
			hasAnnotation = true
			let key = matches[1]
			let value = matches[2].trim()
			if (key in result) {
				result[key].push(value)
			} else {
				result[key] = [value]
			}
		}
		return hasAnnotation ? result : null
	},

	createCommentRegexp: function(query) {
		return new RegExp('((\\/\\/.*)|(\\/\\*(?:[\\s\\S](?!\\*\\/))*?\\s*\\*\\/)|\\s)+(' + query.join('|') + ')')
	}

}
