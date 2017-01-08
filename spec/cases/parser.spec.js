const parser = require('../../src/parser')

const classContent = `
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

const classContentNoAnnotations = `
class MyLogger {
	constructor() {
		this.prefix = "app:"
	}
	log(message) {
		console.log(this.prefix + message)
	}
}`

const moduleContent = `
/**
 * @injectable(foo)
 */
module.exports = function() {
}
`

const moduleContentNotExporting = `
/**
 * @injectable(foo)
 */
function() {
}
`

const functionsContent = `
/**
 * @injectable(foo)
 */
module.exports.createFoo = function() {
}
`

const functionsContentInside = `
module.exports = {
	/**
	 * @injectable(foo)
	 */
	createFoo: function() {
	}
}
`

const functionsContentNoAnnotations = `
module.exports.createFoo = function() {
}
`

const functionsContentCustomName = `
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
			let parsed = parser.parseModuleAnnotations(moduleContent)
			expect(parsed.hasOwnProperty('injectable')).toBe(true)
			expect(parsed.injectable.indexOf('foo')).toBe(0)
		})
		it('should not parse when module exporting nothing', () => {
			let parsed = parser.parseModuleAnnotations(moduleContentNotExporting)
			expect(parsed).toBe(null)
		})
	})

	describe('#parseFunctionAnnotations', () => {
		it('should parse function annotations', () => {
			let parsed = parser.parseFunctionAnnotations(functionsContent, 'createFoo')
			expect(parsed.hasOwnProperty('injectable')).toBe(true)
			expect(parsed.injectable.indexOf('foo')).toBe(0)
		})
		it('should not parse when method is missing', () => {
			let parsed = parser.parseFunctionAnnotations(functionsContent, 'createBar')
			expect(parsed).toBe(null)
		})
		it('should parse function annotations when function in module export', () => {
			let parsed = parser.parseFunctionAnnotations(functionsContentInside, 'createFoo')
			expect(parsed.hasOwnProperty('injectable')).toBe(true)
			expect(parsed.injectable.indexOf('foo')).toBe(0)
		})
		it('should not parse when method has no annotations', () => {
			let parsed = parser.parseFunctionAnnotations(functionsContentNoAnnotations, 'createFoo')
			expect(parsed).toBe(null)
		})
		it('should parse function annotations when function has custom name', () => {
			let parsed = parser.parseFunctionAnnotations(functionsContentCustomName, 'default', 'default_1')
			expect(parsed.hasOwnProperty('injectable')).toBe(true)
			expect(parsed.injectable.indexOf('foo')).toBe(0)
		})
	})

	describe('#parseClassAnnotations', () => {
		it('should parse class annotations', () => {
			let parsed = parser.parseClassAnnotations(classContent)
			expect(parsed.hasOwnProperty('injectable')).toBe(true)
			expect(parsed.injectable.indexOf('logger')).toBe(0)
		})
		it('should not parse when class dont have annotations', () => {
			let parsed = parser.parseClassAnnotations(classContentNoAnnotations)
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
				expect(parsed[0].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[0].annotations.injectable.indexOf('foo')).toBe(0)
				return done()
			}).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})
	})

})
