const parser = require('../../src/parser')

const contentClass = `
class MyLogger {
	/**
	 * @injectable(logger)
	 */
	constructor() {
		this.prefix = "app:"
	}
	log(message) {
		console.log(this.prefix + message)
	}
}`

const contentClassNoAnnotations = `
class MyLogger {
	constructor() {
		this.prefix = "app:"
	}
	log(message) {
		console.log(this.prefix + message)
	}
}`

const contentModule = `
/**
 * @injectable(foo)
 */
module.exports = function() {
}
`

const contentModuleNotExporting = `
/**
 * @injectable(foo)
 */
function() {
}
`

const contentFunctions = `
/**
 * @injectable(foo)
 */
module.exports.createFoo = function() {
}
`

const contentFunctionsInside = `
module.exports = {
	/**
	 * @injectable(foo)
	 */
	createFoo: function() {
	}
}
`

const contentFunctionsNoAnnotations = `
module.exports.createFoo = function() {
}
`

const contentFunctionsCustomName = `
/**
 * @injectable(foo)
 */
function default_1() {
    let router = {name:"test"}
    return router;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
`

describe('Parser', () => {

	describe('#parseModuleAnnotations', () => {
		it('should parse module annotations', () => {
			let parsed = parser.parseModuleAnnotations(contentModule)
			expect(parsed.hasOwnProperty('injectable')).toBe(true)
			expect(parsed.injectable.indexOf('foo')).toBe(0)
		})
		it('should not parse when module exporting nothing', () => {
			let parsed = parser.parseModuleAnnotations(contentModuleNotExporting)
			expect(parsed).toBe(null)
		})
	})

	describe('#parseFunctionAnnotations', () => {
		it('should parse function annotations', () => {
			let parsed = parser.parseFunctionAnnotations(contentFunctions, 'createFoo')
			expect(parsed.hasOwnProperty('injectable')).toBe(true)
			expect(parsed.injectable.indexOf('foo')).toBe(0)
		})
		it('should not parse when method is missing', () => {
			let parsed = parser.parseFunctionAnnotations(contentFunctions, 'createBar')
			expect(parsed).toBe(null)
		})
		it('should parse function annotations when function in module export', () => {
			let parsed = parser.parseFunctionAnnotations(contentFunctionsInside, 'createFoo')
			expect(parsed.hasOwnProperty('injectable')).toBe(true)
			expect(parsed.injectable.indexOf('foo')).toBe(0)
		})
		it('should not parse when method has no annotations', () => {
			let parsed = parser.parseFunctionAnnotations(contentFunctionsNoAnnotations, 'createFoo')
			expect(parsed).toBe(null)
		})
		it('should parse function annotations when function has custom name', () => {
			let parsed = parser.parseFunctionAnnotations(contentFunctionsCustomName, 'default', 'default_1')
			expect(parsed.hasOwnProperty('injectable')).toBe(true)
			expect(parsed.injectable.indexOf('foo')).toBe(0)
		})
	})

	describe('#parseClassAnnotations', () => {
		it('should parse class annotations', () => {
			// note: file_content, class_content (in this case same)
			let parsed = parser.parseClassAnnotations(contentClass, contentClass)
			expect(parsed.hasOwnProperty('injectable')).toBe(true)
			expect(parsed.injectable.indexOf('logger')).toBe(0)
		})
		it('should not parse when class dont have annotations', () => {
			// note: file_content, class_content (in this case same)
			let parsed = parser.parseClassAnnotations(contentClassNoAnnotations, contentClassNoAnnotations)
			expect(parsed).toBe(null)
		})
		it('should not parse when class not provided', () => {
			let parsed = parser.parseClassAnnotations('')
			expect(parsed).toBe(null)
		})
	})

	describe('#parse', () => {
		it('should parse module annotations', (done) => {
			parser.parse(__dirname + '/../files/module.js').then((parsed) => {
				expect(parsed[0].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[0].annotations.injectable.indexOf('foo')).toBe(0)
				return done()
			}).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})
		it('should parse typescript annotations', (done) => {
			parser.parse(__dirname + '/../files/typescript.js').then((parsed) => {
				// exported (default) function
				expect(parsed[0].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[0].annotations.injectable.indexOf('foo')).toBe(0)
				// exported class
				expect(parsed[1].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[1].annotations.injectable.indexOf('bar')).toBe(0)
				return done()
			}).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})
		it('should ignore class parsing when is imported from external file', (done) => {
			parser.parse(__dirname + '/../files/class-imported.js').then((parsed) => {
				expect(parsed.length).toBe(0)
				return done()
			}).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})
	})

})
