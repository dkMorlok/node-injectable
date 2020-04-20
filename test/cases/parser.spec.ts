import { parseFile } from '../../src/parsing'

describe('Parser', () => {

	describe('#parse module.export', () => {

		describe('when exported simple', () => {
			it('should parse function annotations', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/module/function-simple.js')
				expect(parsed.length).toBe(1)
				expect(parsed[0].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[0].annotations.injectable.indexOf('foo')).toBe(0)
			})

			it('should parse async function annotations', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/module/function-simple-async.js')
				expect(parsed.length).toBe(1)
				expect(parsed[0].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[0].annotations.injectable.indexOf('foo')).toBe(0)
			})

			it('should parse class annotations', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/module/class-simple.js')
				expect(parsed.length).toBe(1)
				expect(parsed[0].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[0].annotations.injectable.indexOf('foo')).toBe(0)
			})

			it('should not parse if exported without annotations', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/module/function-simple-ignore.js')
				expect(parsed.length).toBe(0)
			})
		})

		describe('when exported functions', () => {
			it('should parse if exported as property', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/module/function-property.js')
				expect(parsed.length).toBe(3)

				// anonymous function
				expect(parsed[0].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[0].annotations.injectable.indexOf('foo')).toBe(0)

				// named function
				expect(parsed[1].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[1].annotations.injectable.indexOf('bar')).toBe(0)

				// default function
				expect(parsed[2].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[2].annotations.injectable.indexOf('default')).toBe(0)
			})

			it('should parse if exported as property (async)', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/module/function-property-async.js')
				expect(parsed.length).toBe(3)

				// anonymous function
				expect(parsed[0].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[0].annotations.injectable.indexOf('foo')).toBe(0)

				// named function
				expect(parsed[1].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[1].annotations.injectable.indexOf('bar')).toBe(0)

				// default function
				expect(parsed[2].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[2].annotations.injectable.indexOf('default')).toBe(0)
			})

			it('should parse if exported as properties', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/module/function-properties.js')
				expect(parsed.length).toBe(3)
				// anonymous function
				expect(parsed[0].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[0].annotations.injectable.indexOf('foo')).toBe(0)
				// named function
				expect(parsed[1].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[1].annotations.injectable.indexOf('bar')).toBe(0)
				// default function
				expect(parsed[2].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[2].annotations.injectable.indexOf('default')).toBe(0)
			})

			it('should parse if exported as properties (async)', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/module/function-properties-async.js')
				expect(parsed.length).toBe(3)

				// anonymous function
				expect(parsed[0].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[0].annotations.injectable.indexOf('foo')).toBe(0)

				// named function
				expect(parsed[1].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[1].annotations.injectable.indexOf('bar')).toBe(0)

				// default function
				expect(parsed[2].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[2].annotations.injectable.indexOf('default')).toBe(0)
			})

			it('should not parse if exported without annotations', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/module/function-properties-ignore.js')
				expect(parsed.length).toBe(0)
			})
		})

		describe('when exported classes', () => {
			it('should parse if exported as property', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/module/class-property.js')
				expect(parsed.length).toBe(2)
				expect(parsed[0].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[0].annotations.injectable.indexOf('foo')).toBe(0)
				expect(parsed[1].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[1].annotations.injectable.indexOf('bar')).toBe(0)
			})

			it('should not parse imported class', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/module/class-imported.js')
				expect(parsed.length).toBe(0)
			})

			it('should not parse if exported without annotations', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/module/class-ignore.js')
				expect(parsed.length).toBe(0)
			})
		})

	})

	describe('#parse exports', () => {

		describe('when exported functions', () => {
			it('should parse if exported as property', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/exports/function-property.js')
				expect(parsed.length).toBe(3)

				// anonymous function
				expect(parsed[0].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[0].annotations.injectable.indexOf('foo')).toBe(0)

				// named function
				expect(parsed[1].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[1].annotations.injectable.indexOf('bar')).toBe(0)

				// default function
				expect(parsed[2].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[2].annotations.injectable.indexOf('default')).toBe(0)
			})

			it('should parse if exported as property (async)', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/exports/function-property-async.js')
				expect(parsed.length).toBe(3)

				// anonymous function
				expect(parsed[0].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[0].annotations.injectable.indexOf('foo')).toBe(0)

				// named function
				expect(parsed[1].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[1].annotations.injectable.indexOf('bar')).toBe(0)

				// default function
				expect(parsed[2].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[2].annotations.injectable.indexOf('default')).toBe(0)
			})

			it('should not parse if exported without annotations', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/exports/function-property-ignore.js')
				expect(parsed.length).toBe(0)
			})
		})

		describe('when exported classes', () => {
			it('should parse if exported as property', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/exports/class-property.js')
				expect(parsed.length).toBe(2)
				expect(parsed[0].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[0].annotations.injectable.indexOf('foo')).toBe(0)
				expect(parsed[1].annotations.hasOwnProperty('injectable')).toBe(true)
				expect(parsed[1].annotations.injectable.indexOf('bar')).toBe(0)
			})

			it('should not parse imported class', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/exports/class-imported.js')
				expect(parsed.length).toBe(0)
			})

			it('should not parse if exported without annotations', async () => {
				const parsed = await parseFile(__dirname + '/../files/parse/exports/class-ignore.js')
				expect(parsed.length).toBe(0)
			})
		})

	})

})
