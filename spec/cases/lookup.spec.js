const lookup = require('../../src/lookup')

describe('Lookup', function() {

	it('should find module', (done) => {
		lookup.lookupFile(__dirname + '/../files/module.js').then((parsed) => {
			expect(parsed.length).toBe(1)
			expect(parsed[0].name).toBe('foo')
			expect(typeof parsed[0].factory).toBe('function')
			return done()
		}).catch((err) => {
			expect(err).toBe(undefined)
			return done()
		})
	})

	it('should find module functions', (done) => {
		lookup.lookupFile(__dirname + '/../files/functions.js').then((parsed) => {
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
			expect(parsed[3].factory[0]).toBe('joda')
			expect(parsed[3].factory[1]).toBe('windu')
			expect(typeof parsed[3].factory[2]).toBe('function')
			// @injectable(warriors3); @inject(joda); @inject(windu)  [explicit inject via @inject]
			expect(parsed[4].name).toBe('warriors3')
			expect(parsed[4].factory[0]).toBe('joda')
			expect(parsed[4].factory[1]).toBe('windu')
			expect(typeof parsed[4].factory[2]).toBe('function')
			return done()
		}).catch((err) => {
			expect(err).toBe(undefined)
			return done()
		})
	})

	it('should find module class', (done) => {
		lookup.lookupFile(__dirname + '/../files/class-annotated.js').then((parsed) => {
			expect(parsed[0].name).toBe('logger')
			expect(typeof parsed[0].factory).toBe('function')
			return done()
		}).catch((err) => {
			expect(err).toBe(undefined)
			return done()
		})
	})

	it('should dont find module class', (done) => {
		lookup.lookupFile(__dirname + '/../files/class-normal.js').then((parsed) => {
			expect(parsed.length).toBe(0)
			return done()
		}).catch((err) => {
			expect(err).toBe(undefined)
			return done()
		})
	})

	it('should find module classes', (done) => {
		lookup.lookupFile(__dirname + '/../files/classes.js').then((parsed) => {
			// not annotated injections
			expect(parsed.length).toBe(2)
			expect(parsed[0].name).toBe('logger')
			expect(typeof parsed[0].factory).toBe('function')
			// annotated injections
			expect(parsed[1].name).toBe('debugger')
			expect(parsed[1].factory[0]).toBe('logger')
			expect(typeof parsed[1].factory[1]).toBe('function')
			return done()
		}).catch((err) => {
			expect(err).toBe(undefined)
			return done()
		})
	})

})
