const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')
const caller = require('caller')
const readFileAsync = Promise.promisify(fs.readFile)

const classRegexp = /((\/\/.*)|(\/\*(?:[\s\S](?!\*\/))*?\s*\*\/)|\s)*\s*(constructor\s*\()/
const annotationRegexp = /@([a-zA-Z_][a-zA-Z0-9]*)\((.*)\)/g

module.exports = {

	parse: function(filePath) {
		let absolutePath = path.resolve(path.dirname(caller()), filePath)
		return readFileAsync(absolutePath, {encoding: 'utf-8'}).then((fileContent) => {
			return this.parseFileAnnotations(absolutePath, fileContent)
		})
	},

	parseFileAnnotations: function(absolutePath, fileContent) {
		let moduleToLoad = require(absolutePath)
		let result = []

		// module can be exported as function
		if (moduleToLoad instanceof Function) {
			let annotations = null
			let functContent = moduleToLoad.toString()
			if (functContent.indexOf('construct') > 0) {
				annotations = this.parseClassAnnotations(fileContent, functContent)
			} else {
				annotations = this.parseModuleAnnotations(fileContent)
			}
			if (annotations) {
				result.push({
					ref: moduleToLoad,
					name: path.basename(absolutePath, path.extname(absolutePath)),
					annotations: annotations
				})
			}
		}

		// module can export many functions
		for (let name in moduleToLoad) {
			if (moduleToLoad[name] instanceof Function) {
				let annotations = null
				let functContent = moduleToLoad[name].toString()
				if (functContent.indexOf('construct') > 0) {
					annotations = this.parseClassAnnotations(fileContent, functContent)
				} else {
					let matches = functContent.match(/function\s*(\S+)\s*\(/)
					annotations = this.parseFunctionAnnotations(fileContent, name, matches ? matches[1] : null)
				}
				if (annotations) {
					result.push({
						ref: moduleToLoad[name],
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
		let regex = new RegExp('((\\/\\/.*)|(\\/\\*(?:[\\s\\S](?!\\*\\/))*?\\s*\\*\\/)|\\s)*(' + query.join('|') + ')')
		let matches = regex.exec(fileContent)
		return matches ? this.parseCommentAnnotations(matches[0]) : null
	},

	parseFunctionAnnotations: function(fileContent, name, functName = null) {
		let query = [
			name + '\\s*:\\s*function\\s*\\(',
			'(module\\.)?exports\\.' + name + '\\s*=\\s*'
		]
		if (functName) {
			query.push('\\s*function\\s*' + functName + '\\s*\\(')
		}
		let regex = new RegExp('((\\/\\/.*)|(\\/\\*(?:[\\s\\S](?!\\*\\/))*?\\s*\\*\\/)|\\s)*(' + query.join('|') + ')')
		let matches = regex.exec(fileContent)
		return matches ? this.parseCommentAnnotations(matches[0]) : null
	},

	parseClassAnnotations: function(fileContent, classContent) {
		let matches = classRegexp.exec(classContent)
		if (matches && fileContent.indexOf(matches[0]) >= 0) {
			return this.parseCommentAnnotations(matches[0])
		} else {
			return null
		}
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
	}

}
