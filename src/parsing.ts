import fs from 'fs'
import path from 'path'
import caller from 'caller'
import { promisify } from 'util'

const readFileAsync = promisify(fs.readFile)
const classCommentRegexp = /((\/\/.*)|(\/\*(?:[\s\S](?!\*\/))*?\s*\*\/))+\s*(constructor\s*\()/
const annotationRegexp = /@([a-zA-Z_][a-zA-Z0-9]*)\((.*)\)/g

export function parseFile(filePath: string) {
	const absolutePath = path.resolve(path.dirname(caller()), filePath)
	return readFileAsync(absolutePath, {encoding: 'utf-8'}).then((fileContent) => {
		return parseFileAnnotations(absolutePath, fileContent)
	})
}

function parseFileAnnotations(absolutePath: string, fileContent: string): any {
	const exported = require(absolutePath)
	const result = []

	// module can be exported as function
	if (exported instanceof Function) {
		let annotations
		const content = exported.toString()
		if (content.indexOf('construct') > 0) {
			annotations = parseClassAnnotations(fileContent, null, exported, content)
		} else {
			annotations = parseModuleAnnotations(fileContent)
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
	for (const name in exported) {
		if (typeof exported[name] === 'function') {
			const annotations = parseModuleDefinitionAnnotations(fileContent, name, exported[name])
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
}

function parseModuleAnnotations(fileContent: string): any {
	const query = [
		'module\\.exports\\s*=\\s*(:?(async\\s+)?function\\s*\\([\\S\\s]*?\\))?\\s*{'
	]

	const matchesComment = createCommentRegexp(query).exec(fileContent)
	//console.log("\n\n", fileContent, matchesComment, createCommentRegexp(query))
	if (!matchesComment) {
		return null
	}

	return parseCommentAnnotations(matchesComment[0])
}

function parseModuleDefinitionAnnotations(fileContent: string, property: string, definition: any): any {
	const content = definition.toString()
	if (content.indexOf('construct') > 0) {
		return parseClassAnnotations(fileContent, property, definition, content)
	} else {
		return parseFunctionAnnotations(fileContent, property, definition, content)
	}
}

function parseFunctionAnnotations(fileContent: string, property: string, definition: any, content: string): any {
	const query = [
		property + '\\s*:\\s*(async\\s+)?function(\\s+\\S+)?\\s*\\(',
		'(module\\.)?exports\\.' + property + '\\s*=\\s*',
	]
	if (property === 'default') {
		query.push('\\s*export\\s+(default\\s+)?(async\\s+)?function\\s*\\(')
	}
	const matches = content.match(/function\s*([^(]+)?\s*\(/)
	if (matches && matches[1]) {
		query.push('\\s*(export\\s+(default\\s+)?)?(async\\s+)?function\\s+' + matches[1] + '\\s*\\(')
	}

	const matchesComment = createCommentRegexp(query).exec(fileContent)
	if (!matchesComment) {
		return null
	}

	return parseCommentAnnotations(matchesComment[0])
}

function parseClassAnnotations(fileContent: string, property: string | null, definition: any, content: string): any {
	const regexp = new RegExp('class\\s+' + definition.name)
	const matches = regexp.exec(fileContent)
	if (!matches) {
		return null
	}

	const matchesComment = classCommentRegexp.exec(content)
	if (!matchesComment) {
		return null
	}

	return parseCommentAnnotations(matchesComment[1])
}

function parseCommentAnnotations(comment: string) {
	let matches
	let result: any = {}
	let hasAnnotation: boolean = false
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

function createCommentRegexp(query: string[]) {
	return new RegExp('((\\/\\/.*)|(\\/\\*(?:[\\s\\S](?!\\*\\/))*?\\s*\\*\\/)|\\s)+(' + query.join('|') + ')')
}
