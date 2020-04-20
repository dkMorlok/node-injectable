import { lookupFile } from '../../src/lookup'

describe('Lookup', () => {

	it('should find module', async () => {
		const parsed = await lookupFile(__dirname + '/../files/lookup/module.js')
		expect(parsed.length).toBe(1)
		expect(parsed[0].name).toBe('foo')
		expect(typeof parsed[0].factory).toBe('function')
	})

	it('should find module functions', async () => {
		const parsed = await lookupFile(__dirname + '/../files/lookup/functions.js')
		expect(parsed.length).toBe(5)

		// @injectable(joda)  [no inject]
		expect(parsed[0].name).toBe('joda')
		expect(typeof parsed[0].factory).toBe('function')

		// @injectable(windu)  [no inject]
		expect(parsed[1].name).toBe('windu')
		expect(typeof parsed[1].factory).toBe('function')

		// @injectable()  [implicit inject]
		expect(parsed[2].name).toBe('createWarriors1')
		expect(typeof parsed[2].factory).toBe('function')

		// @injectable(warriors2 joda,windu)  [explicit inject]
		expect(parsed[3].name).toBe('warriors2')
		expect(parsed[3].dependencies[0]).toBe('joda')
		expect(parsed[3].dependencies[1]).toBe('windu')
		expect(typeof parsed[3].factory).toBe('function')

		// @injectable(warriors3); @inject(joda); @inject(windu)  [explicit inject via @inject]
		expect(parsed[4].name).toBe('warriors3')
		expect(parsed[4].dependencies[0]).toBe('joda')
		expect(parsed[4].dependencies[1]).toBe('windu')
		expect(typeof parsed[4].factory).toBe('function')
	})

	it('should find module class', async () => {
		const parsed = await lookupFile(__dirname + '/../files/lookup/class-annotated.js')
		expect(parsed[0].name).toBe('logger')
		expect(typeof parsed[0].factory).toBe('function')
	})

	it('should dont find module class', async () => {
		const parsed = await lookupFile(__dirname + '/../files/lookup/class-normal.js')
		expect(parsed.length).toBe(0)
	})

	it('should find module classes', async () => {
		const parsed = await lookupFile(__dirname + '/../files/lookup/classes.js')

		// not annotated injections
		expect(parsed.length).toBe(2)
		expect(parsed[0].name).toBe('logger')
		expect(typeof parsed[0].factory).toBe('function')

		// annotated injections
		expect(parsed[1].name).toBe('debugger')
		expect(parsed[1].dependencies[0]).toBe('logger')
		expect(typeof parsed[1].factory).toBe('function')
	})

})
