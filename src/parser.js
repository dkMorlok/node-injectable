const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')
const caller = require('caller')

const readFileAsync = Promise.promisify(fs.readFile)

module.exports = function (filePath) {
	var absolutePath = path.resolve(path.dirname(caller()), filePath)
	return readFileAsync(absolutePath, {encoding: 'utf-8'}).then((fileContent) => {
		return getAnnotations(absolutePath, fileContent)
	})
}

function getAnnotations(absolutePath, fileContent) {
	let result = {
		module: {},
		functions: {}
	}

	let moduleToLoad = require(absolutePath)
	result.module = {
		ref: moduleToLoad,
		name: path.basename(absolutePath, path.extname(absolutePath)),
		annotations: parseAnnotations(fileContent, 'module')
	}

	for (let name in moduleToLoad) {
		if (moduleToLoad[name] instanceof Function) {
			result.functions[name] = {
				ref: moduleToLoad[name],
				name: name,
				annotations: parseAnnotations(fileContent, 'function', name)
			}
		}
	}

	return result;
}


function parseAnnotations(fileContent, type, name = null) {
	let suffixes = ({
		function: [name + '\\s*:\\s*function\\s*\\(', '(module\\.)?exports\\.' + name + '\\s*=\\s*'],
		module: ['module\\.exports\\s*=\\s*(:?function\\s*\\([\\S\\s]*?\\))?\\s*{']
	})[type]

	let regex = new RegExp('((\\/\\/.*)|(\\/\\*(?:[\\s\\S](?!\\*\\/))*?\\s*\\*\\/)|\\s)*(' + suffixes.join('|') + ')')
	let matches = regex.exec(fileContent)
	if (!matches ) {
		return {}
	}

	let result = {}
	let annotationRegex = /@([a-zA-Z_][a-zA-Z0-9]*)\((.*)\)/g
	let annotationMatches
	while (annotationMatches = annotationRegex.exec(matches[0])) {
		let key = annotationMatches[1]
		let value = annotationMatches[2].trim()
		if (key in result) {
			result[key].push(value)
		} else {
			result[key] = [value]
		}
	}

	return result
}
