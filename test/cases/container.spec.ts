import * as path from 'path'
import { Container } from '../../src/container'

describe('Container', () => {
	let container: Container

	beforeEach(() => {
		container = new Container()
	})

	describe('#add', () => {
		test('should add module', () => {
			container.add('module1', 'foo')
			expect(container.has('module1')).toBe(true)
			const resolved = container.resolve('module1')
			expect(resolved).toBe('foo')
		})

		test('should add module when was removed', () => {
			container.add('module1', 'foo')
			container.remove('module1')
			container.add('module1', 'foo')
		})

		test('should throw error when already added', () => {
			container.add('module1', 'foo')
			expect(() => {
				container.add('module1', 'bar')
			}).toThrow()
		})
	})

	describe('#remove', () => {
		test('should throw error when module not exist', () => {
			container.add('module1', 'foo')
			container.remove('module1')
			expect(() => {
				container.remove('module1')
			}).toThrow()
		})
	})

	describe('#register', () => {
		test('should register module', () => {
			container.register('module1', () => {
				return 'foo'
			})
			const resolved = container.resolve('module1')
			expect(resolved).toBe('foo')
		})

		test('should throw error when module already registered', () => {
			container.register('module1', () => {
				return 'foo'
			})
			expect(() => {
				container.register('module1', () => {
					return 'bar'
				})
			}).toThrow()
		})

		test('should throw error when missing factory function', () => {
			expect(() => {
				container.register('module1', null, ['dep1', 'dep2'])
			}).toThrow()
		})
	})

	describe('#resolve', () => {
		test('should resolve same object', () => {
			const object = ['foo']
			container.register('module1', function () {
				return object
			})
			const moduleA = container.resolve('module1')
			const moduleB = container.resolve('module1')
			expect(moduleA).toBe(moduleB)
		})

		test('should resolve functions with dependencies', () => {
			container.register('module1', function () {
				return 'foo'
			})
			container.register('module2', function (module1) {
				return module1 + 'bar'
			})
			const resolved = container.resolve('module2')
			expect(resolved).toBe('foobar')
		})

		test('should resolve classes with dependencies', () => {
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

			const object: any = container.resolve('bar')
			expect(object instanceof BarClass).toBe(true)
			expect(object.name).toBe('foobar')
		})

		test('should throw error when dependency missing', () => {
			container.register('module1', function (moduleMissing) {
				return 'foo'
			})
			expect(() => {
				container.resolve('module1')
			}).toThrow('Module module1 has missing dependency moduleMissing')
		})

		test('should throw error when module has cycle dependency', () => {
			container.register('module1', function (module2) {
				return 'foo'
			})
			container.register('module2', function (module1) {
				return 'bar'
			})
			expect(() => {
				container.resolve('module1')
			}).toThrow('Module module2 has cyclic dependency on module1')
		})

		test('should throw error when module not exists', () => {
			expect(() => {
				container.resolve('module1')
			}).toThrow('Missing module module1')
		})
	})

	describe('#inject', () => {
		beforeEach(() => {
			container.register('foo', () => 'foo')
			container.register('bar', () => 'bar')
		})

		test('should inject function dependencies by params', (done) => {
			container.inject(function (foo, bar) {
				expect(foo).toBe('foo')
				expect(bar).toBe('bar')
				return done()
			})
		})

		test('should inject function dependencies by names', (done) => {
			container.inject(function (dep1, dep2) {
				expect(dep1).toBe('foo')
				expect(dep2).toBe('bar')
				return done()
			}, ['foo', 'bar'])
		})

		test('should inject class dependencies by params', () => {
			const TestClass = class {
				private foo
				private bar
				constructor(foo, bar) {
					this.foo = foo
					this.bar = bar
				}
			}

			const instance: any = container.inject(TestClass)
			expect(instance).toBeInstanceOf(TestClass)
			expect(instance.foo).toBe('foo')
			expect(instance.bar).toBe('bar')
		})

		test('should inject class dependencies by names', () => {
			const TestClass = class {
				private foo
				private bar
				constructor(dep1, dep2) {
					this.foo = dep1
					this.bar = dep2
				}
			}

			const instance: any = container.inject(TestClass, ['foo', 'bar'])
			expect(instance instanceof TestClass).toBe(true)
			expect(instance.foo).toBe('foo')
			expect(instance.bar).toBe('bar')
		})

		test('should inject class without dependencies', () => {
			const TestClass = class {
				log(message) {}
			}
			const instance = container.inject(TestClass)
			expect(instance).toBeInstanceOf(TestClass)
		})

		test('should throw error when missing factory function', () => {
			expect(() => {
				container.inject(null, ['foo', 'bar'])
			}).toThrow()
		})
	})

	describe('#lookup', () => {
		test('should load modules from file', async () => {
			const result = await container.lookup(__dirname + '/../files/lookup/module.js')
			expect(result.length).toBe(1)
			expect(result[0].file).toBe(path.normalize(__dirname + '/../files/lookup/module.js'))
			expect(Array.isArray(result[0].definitions)).toBe(true)
		})

		test('should load modules from files', async () => {
			const result = await container.lookup([__dirname + '/../files/lookup/module.js', __dirname + '/../files/lookup/functions.js'])
			expect(result.length).toBe(2)
			expect(result[0].file).toBe(path.normalize(__dirname + '/../files/lookup/module.js'))
			expect(Array.isArray(result[0].definitions)).toBe(true)
			expect(result[1].file).toBe(path.normalize(__dirname + '/../files/lookup/functions.js'))
			expect(Array.isArray(result[1].definitions)).toBe(true)
		})

		test('should load modules from files', async () => {
			await container.lookup([__dirname + '/../files/lookup/module.js', __dirname + '/../files/lookup/functions.js'])
			expect(container.get('warriors2')).toStrictEqual(['joda', 'windu'])
		})

		test('should load modules from files (lazy)', async () => {
			await container.lookup([__dirname + '/../files/lookup/module.js', __dirname + '/../files/lookup/functions.js'])
			expect(container.has('warriors2')).toBe(true)
			container.set('joda', 'Master joda')
			expect(container.get('warriors2')).toStrictEqual(['Master joda', 'windu'])
		})
	})

})
