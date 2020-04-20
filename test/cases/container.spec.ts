import * as path from 'path'
import { Container } from '../../src/container'

describe('Container', () => {
	let container: Container

	beforeEach(() => {
		container = new Container()
	})

	describe('#get', () => {
		it('returns module object when registered', () => {
			container.add('foo', 'foo')
			expect(container.get('foo')).toBeTruthy()
		})

		it('returns null when not registered', () => {
			expect(container.get('foo')).toBe(null)
		})
	})

	describe('#add', () => {
		it('should add module', async () => {
			container.add('module1', 'foo')
			expect(container.has('module1')).toBe(true)
			const resolved = await container.resolve('module1')
			expect(resolved).toBe('foo')
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
		it('should register module', async () => {
			container.register('module1', () => {
				return 'foo'
			})
			const resolved = await container.resolve('module1')
			expect(resolved).toBe('foo')
		})

		it('should throw error when module already registered', () => {
			container.register('module1', () => {
				return 'foo'
			})
			expect(() => {
				container.register('module1', () => {
					return 'bar'
				})
			}).toThrow()
		})

		it('should throw error when missing factory function', () => {
			expect(() => {
				container.register('module1', null, ['dep1', 'dep2'])
			}).toThrow()
		})
	})

	describe('#resolve', () => {
		it('should resolve same object', async () => {
			const object = ['foo']
			container.register('module1', function () {
				return object
			})
			const moduleA = await container.resolve('module1')
			const moduleB = await container.resolve('module1')
			expect(moduleA).toBe(moduleB)
		})

		it('should resolve functions with dependencies', async () => {
			container.register('module1', function () {
				return 'foo'
			})
			container.register('module2', function (module1) {
				return module1 + 'bar'
			})
			const resolved = await container.resolve('module2')
			expect(resolved).toBe('foobar')
		})

		it('should resolve classes with dependencies', async () => {
			const FooClass = class {
				private name
				constructor() {
					this.name = 'foo'
				}
			}
			const BarClass = class {
				private name
				constructor(foo) {
					this.name = foo.name + 'bar'
				}
			}
			container.register('foo', FooClass)
			container.register('bar', BarClass)

			const object: any = await container.resolve('bar')
			expect(object instanceof BarClass).toBe(true)
			expect(object.name).toBe('foobar')
		})

		it('should throw error when dependency missing', (done) => {
			container.register('module1', function (moduleMissing) {
				return 'foo'
			})
			container.resolve('module1').then((resolved) => {
				expect(resolved).toBe(undefined)
				return done()
			}).catch((err) => {
				expect(err.message.indexOf('Module module1 has missing dependency moduleMissing') >= 0).toBe(true)
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
			container.resolve('module1').then((resolved) => {
				expect(resolved).toBe(undefined)
				return done()
			}).catch((err) => {
				expect(err.message.indexOf('Module module2 has cyclic dependency on module1') >= 0).toBe(true)
				return done()
			})
		})

		it('should throw error when module not exists', (done) => {
			container.resolve('module1').then((resolved) => {
				expect(resolved).toBe(undefined)
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
			container.inject(function (dep1, dep2) {
				expect(dep1).toBe('foo')
				expect(dep2).toBe('bar')
				return done()
			}, ['foo', 'bar']).catch((err) => {
				expect(err).toBe(undefined)
				return done()
			})
		})

		it('should inject class dependencies by params', async () => {
			const TestClass = class {
				private foo
				private bar
				constructor(foo, bar) {
					this.foo = foo
					this.bar = bar
				}
			}

			const instance: any = await container.inject(TestClass)
			expect(instance instanceof TestClass).toBe(true)
			expect(instance.foo).toBe('foo')
			expect(instance.bar).toBe('bar')
		})

		it('should inject class dependencies by names', async () => {
			const TestClass = class {
				private foo
				private bar
				constructor(dep1, dep2) {
					this.foo = dep1
					this.bar = dep2
				}
			}

			const instance: any = await container.inject(TestClass, ['foo', 'bar'])
			expect(instance instanceof TestClass).toBe(true)
			expect(instance.foo).toBe('foo')
			expect(instance.bar).toBe('bar')
		})

		it('should inject class without dependencies', async () => {
			const TestClass = class {
				log(message) {
					return message
				}
			}
			const instance = await container.inject(TestClass)
			expect(instance instanceof TestClass).toBe(true)
		})

		it('should throw error when missing factory function', (done) => {
			container.inject(null, ['foo', 'bar']).catch((err) => {
				expect(err).toBeTruthy()
				done()
			})
		})
	})

	describe('#lookup', () => {
		it('should load modules from file', async () => {
			const result = await container.lookup(__dirname + '/../files/lookup/module.js')
			expect(result.length).toBe(1)
			expect(result[0].file).toBe(path.normalize(__dirname + '/../files/lookup/module.js'))
			expect(Array.isArray(result[0].definitions)).toBe(true)
		})

		it('should load modules from multiple file', async () => {
			const result = await container.lookup([__dirname + '/../files/lookup/module.js', __dirname + '/../files/lookup/functions.js'])
			expect(result.length).toBe(2)
			expect(result[0].file).toBe(path.normalize(__dirname + '/../files/lookup/module.js'))
			expect(Array.isArray(result[0].definitions)).toBe(true)
			expect(result[1].file).toBe(path.normalize(__dirname + '/../files/lookup/functions.js'))
			expect(Array.isArray(result[1].definitions)).toBe(true)
		})
	})

})
