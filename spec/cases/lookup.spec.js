const parser = require('../../src/lookup')

describe('Lookup', function() {

	it('should find module', function(done) {
		parser.lookupFile(__dirname + '/../files/module.js').then((parsed) => {
			expect(parsed.length).toBe(1)
			expect(parsed[0].name).toBe('foo')
			expect(typeof parsed[0].factory).toBe('function')
			return done()
		})
	})

	it('should find functions', function(done) {
		parser.lookupFile(__dirname + '/../files/functions.js').then((parsed) => {
			expect(parsed.length).toBe(5)
			expect(parsed[0].name).toBe('joda')
			expect(parsed[1].name).toBe('windu')
			expect(parsed[2].name).toBe('warriors1')
			expect(parsed[2].factory[0]).toBe('joda')
			expect(parsed[2].factory[1]).toBe('windu')
			expect(parsed[3].name).toBe('createWarriors2')
			expect(typeof parsed[3].factory).toBe('function')
			expect(parsed[4].name).toBe('warriors3')
			expect(parsed[4].factory[0]).toBe('joda')
			expect(parsed[4].factory[1]).toBe('windu')
			return done()
		})
	})

})
