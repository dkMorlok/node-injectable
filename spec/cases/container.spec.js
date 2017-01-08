const path = require('path')
const injectable = require('../../index')

describe('Container', function() {
	let container

	beforeEach(() => {
		container = new injectable.Container()
	})

	describe('#add', () => {
		it('should add module', (done) => {
			container.add('module1', 'foo')
			expect(container.has('module1')).toBe(true)
			container.resolve('module1').then((module) => {
				expect(module).toBe('foo')
				return done()
			})
		})

		it('should add module when was removed', () => {
			container.add('module1', 'foo')
			container.remove('module1')
			container.add('module1', 'foo')
		})

		it('should throw error when already added', () => {
			container.add('module1', 'foo')
			expect(() => {
				container.add('module1', 'bar')
			}).toThrow()
		})
	})

	describe('#remove', () => {
		it('should throw error when module not exist', () => {
			container.add('module1', 'foo')
			container.remove('module1')
			expect(() => {
				container.remove('module1')
			}).toThrow()
		})
	})

	describe('#register', () => {
		it('should register module', (done) => {
			container.register('module1', function () {
				return 'foo'
			})
			container.resolve('module1').then((module) => {
				expect(module).toBe('foo')
				return done()
			}).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})

		it('should throw error when module already registered', () => {
			container.register('module1', function () {
				return 'foo'
			})
			expect(() => {
				container.register('module1', function () {
					return 'bar'
				})
			}).toThrow()
		})

		it('should throw error when missing factory function', () => {
			expect(() => {
				container.register('module1', ['dep1', 'dep2'])
			}).toThrow()
		})
	})

	describe('#resolve', () => {
		it('should resolve same object', (done) => {
			let object = ['foo']
			container.register('module1', function () {
				return object
			})
			container.resolve('module1').then((moduleA) => {
				return container.resolve('module1')
				.then((moduleB) => {
					expect(moduleA).toBe(moduleB)
					return done()
				})
			}).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})

		it('should resolve functions with dependencies', (done) => {
			container.register('module1', function () {
				return 'foo'
			})
			container.register('module2', function (module1) {
				return module1 + 'bar'
			})
			container.resolve('module2').then((module) => {
				expect(module).toBe('foobar')
				return done()
			}).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})

		it('should resolve classes with dependencies', (done) => {
			const FooClass = class {
				constructor() {
					this.name = 'foo'
				}
			}
			const BarClass = class {
				constructor(foo) {
					this.name = foo.name + 'bar'
				}
			}
			container.register('foo', FooClass)
			container.register('bar', BarClass)
			container.resolve('bar').then((object) => {
				expect(object instanceof BarClass).toBe(true)
				expect(object.name).toBe('foobar')
				return done()
			}).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})

		it('should throw error when dependency missing', (done) => {
			container.register('module1', function (moduleMissing) {
				return 'foo'
			})
			container.resolve('module1').then((module) => {
				expect(module).toBe(undefined)
				return done()
			}).catch((err) => {
				expect(err.message).toBe('Module module1 missing dependencies: moduleMissing')
				return done()
			})
		})

		it('should throw error when module has cycle dependency', (done) => {
			container.register('module1', function (module2) {
				return 'foo'
			})
			container.register('module2', function (module1) {
				return 'bar'
			})
			container.resolve('module1').then((module) => {
				expect(module).toBe(undefined)
				return done()
			}).catch((err) => {
				expect(err.message).toBe('Module module1 has cycle dependencies: module1 -> module2 -> module1')
				return done()
			})
		})

		it('should throw error when module not exists', (done) => {
			container.resolve('module1').then((module) => {
				expect(module).toBe(undefined)
				return done()
			}).catch((err) => {
				expect(err.message).toBe('Missing module module1')
				return done()
			})
		})
	})

	describe('#inject', () => {
		beforeEach(() => {
			container.register('foo', function () {
				return 'foo'
			})
			container.register('bar', function () {
				return 'bar'
			})
		})

		it('should inject function dependencies by params', (done) => {
			container.inject(function (foo, bar) {
				expect(foo).toBe('foo')
				expect(bar).toBe('bar')
				return done()
			}).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})

		it('should inject function dependencies by names', (done) => {
			container.inject(['foo', 'bar', function (dep1, dep2) {
				expect(dep1).toBe('foo')
				expect(dep2).toBe('bar')
				return done()
			}]).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})

		it('should inject class dependencies by params', (done) => {
			const TestClass = class {
				constructor(foo, bar) {
					this.foo = foo
					this.bar = bar
				}
			}
			container.inject(TestClass).then((instance) => {
				expect(instance instanceof TestClass).toBe(true)
				expect(instance.foo).toBe('foo')
				expect(instance.bar).toBe('bar')
				return done()
			}).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})

		it('should inject class dependencies by names', (done) => {
			const TestClass = class {
				constructor(dep1, dep2) {
					this.foo = dep1
					this.bar = dep2
				}
			}
			container.inject(['foo', 'bar', TestClass]).then((instance) => {
				expect(instance instanceof TestClass).toBe(true)
				expect(instance.foo).toBe('foo')
				expect(instance.bar).toBe('bar')
				return done()
			}).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})

		it('should inject class without dependencies', (done) => {
			const TestClass = class {
				log(message) {
					return message
				}
			}
			container.inject(TestClass).then((instance) => {
				expect(instance instanceof TestClass).toBe(true)
				return done()
			}).catch((err) => {
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
