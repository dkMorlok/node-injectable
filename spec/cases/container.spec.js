const path = require('path')
const injectable = require('../../index')

describe('Container', function() {
	let container

	beforeEach(function() {
		container = new injectable.Container()
	})

	describe('#add', function() {
		it('should add module', function(done) {
			container.add('module1', 'foo')
			expect(container.has('module1')).toBe(true)
			container.resolve('module1').then((module) => {
				expect(module).toBe('foo')
				return done()
			})
		})

		it('should add module when was removed', function() {
			container.add('module1', 'foo')
			container.remove('module1')
			container.add('module1', 'foo')
		})

		it('should throw error when already added', function() {
			container.add('module1', 'foo')
			expect(function() {
				container.add('module1', 'bar')
			}).toThrow()
		})
	})

	describe('#remove', function() {
		it('should throw error when module not exist', function() {
			container.add('module1', 'foo')
			container.remove('module1')
			expect(function() {
				container.remove('module1')
			}).toThrow()
		})
	})

	describe('#register', function() {
		it('should register module', function(done) {
			container.register('module1', function() {
				return 'foo'
			})
			container.resolve('module1').then(function(module) {
				expect(module).toBe('foo')
				return done()
			}).catch(function(err) {
				expect(err).toBe(undefined)
				return done()
			})
		})

		it('should throw error when already registered', function() {
			container.register('module1', function() {
				return 'foo'
			})
			expect(function() {
				container.register('module1', function() {
					return 'bar'
				})
			}).toThrow()
		})

		it('should throw error when missing factory function', function() {
			expect(function() {
				container.register('module1', ['dep1', 'dep2'])
			}).toThrow()
		})
	})

	describe('#resolve', function() {
		it('should resolve same object', function(done) {
			let object = ['foo']
			container.register('module1', function() {
				return object
			})
			container.resolve('module1').then(function(moduleA) {
				return container.resolve('module1')
				.then(function(moduleB) {
					expect(moduleA).toBe(moduleB)
					return done()
				})
			}).catch(function(err) {
				expect(err).toBe(undefined)
				return done()
			})
		})

		it('should resolve module with dependencies', function(done) {
			container.register('module1', function() {
				return 'foo'
			})
			container.register('module2', function(module1) {
				return module1 + 'bar'
			})
			container.resolve('module2').then(function(module) {
				expect(module).toBe('foobar')
				return done()
			}).catch(function(err) {
				expect(err).toBe(undefined)
				return done()
			})
		})

		it('should throw error when dependency missing', function(done) {
			container.register('module1', function(moduleMissing) {
				return 'foo'
			})
			container.resolve('module1').then(function(module) {
				expect(module).toBe(undefined)
				return done()
			}).catch(function(err) {
				expect(err.message).toBe('Module module1 missing dependencies: moduleMissing')
				return done()
			})
		})

		it('should throw error when dependency has cycle on other module', function(done) {
			container.register('module1', function(module2) {
				return 'foo'
			})
			container.register('module2', function(module1) {
				return 'bar'
			})
			container.resolve('module1').then(function(module) {
				expect(module).toBe(undefined)
				return done()
			}).catch(function(err) {
				expect(err.message).toBe('Module module1 has cycle dependencies: module1 -> module2 -> module1')
				return done()
			})
		})

		it('should throw error when module not exists', function(done) {
			container.resolve('module1').then(function(module) {
				expect(module).toBe(undefined)
				return done()
			}).catch(function(err) {
				expect(err.message).toBe('Missing module module1')
				return done()
			})
		})
	})

	describe('#inject', () => {
		beforeEach(() => {
			container.register('foo', function() {
				return 'foo'
			})
			container.register('bar', function() {
				return 'bar'
			})
		})

		it('should inject dependencies by params', (done) => {
			container.inject(function(foo, bar) {
				expect(foo).toBe('foo')
				expect(bar).toBe('bar')
				return done()
			}).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})

		it('should inject dependencies by names', (done) => {
			container.inject(['foo', 'bar', function(dep1, dep2) {
				expect(dep1).toBe('foo')
				expect(dep2).toBe('bar')
				return done()
			}]).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})

		it('should throw error when missing factory function', () => {
			expect(() => {
				container.inject(['foo', 'bar'])
			}).toThrow()
		})
	})

	describe('#lookup', () => {
		it('should load modules from file', (done) => {
			container.lookup(__dirname + '/../files/module.js').then((result) => {
				expect(result.length).toBe(1)
				expect(result[0].file).toBe(path.normalize(__dirname + '/../files/module.js'))
				expect(Array.isArray(result[0].modules)).toBe(true)
				return done()
			}).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})

		it('should load modules from multiple file', (done) => {
			container.lookup([__dirname + '/../files/module.js', __dirname + '/../files/functions.js']).then((result) => {
				expect(result.length).toBe(2)
				expect(result[0].file).toBe(path.normalize(__dirname + '/../files/module.js'))
				expect(Array.isArray(result[0].modules)).toBe(true)
				expect(result[1].file).toBe(path.normalize(__dirname + '/../files/functions.js'))
				expect(Array.isArray(result[1].modules)).toBe(true)
				return done()
			}).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})
	})
})
