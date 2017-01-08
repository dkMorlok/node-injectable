const Promise = require('bluebird')
const multiGlob = require('multi-glob')
const helpers = require('./helpers')
const Module = require('./module')
const lookup = require('./lookup')

class Container {

	constructor() {
		this.modules = new Map()
		this.resolving = new Set()
	}

	add(name, service) {
		this.register(name, function() { return service })
		return this.resolve(name)
	}

	has(name) {
		return this.modules.has(name)
	}

	remove(name) {
		if (!this.modules.has(name)) {
			throw new Error(`Module ${name} not exists`)
		}
		this.modules.delete(name)
	}

	register(name, definition) {
		if (this.modules.has(name)) {
			throw new Error(`Module ${name} already registered`)
		}

		let factory, dependencies
		if (typeof definition == 'function') {
			factory = definition
			dependencies = helpers.extractDependencies(factory)
		} else {
			factory = definition[definition.length - 1]
			dependencies = definition.slice(0, -1)
		}
		if (typeof factory != 'function') {
			throw new Error(`Module ${name} factory function is not function`)
		}

		if (/^\s*class\s+/.test(factory.toString())) {
			const _factory = factory
			factory = function(...args) {
				return new _factory(...args)
			}
		}

		this.modules.set(name, new Module(name, factory, dependencies))
	}

	resolve(name) {
		if (!this.modules.has(name)) {
			return Promise.reject(new Error(`Missing module ${name}`))
		}

		let module = this.modules.get(name)
		if (module.state == 'resolved') {
			return Promise.resolve(module.exported)
		}
		if (module.state == 'resolving') {
			return module.resolvingPromise;
		}

		let path = [module.name]
		try {
			helpers.checkDependencies(this.modules, path)
		} catch (err) {
			return Promise.reject(new Error(`Resolving module ${path.join(' -> ')} cause error ${err}`))
		}

		this.resolving.add(name)
		module.state = 'resolving'
		module.resolvingPromise = Promise.all(module.dependencies).map((dep) => {
			return this.resolve(dep)
		}).then((deps) => {
			this.resolving.delete(name)
			let exported = module.factory.apply(module.factory, deps)
			module.state = 'resolved'
			module.exported = exported
			return exported
		})

		return module.resolvingPromise
	}

	inject(definition, ctx) {
		let factory, dependencies
		if (typeof definition == 'function') {
			factory = definition
			dependencies = helpers.extractDependencies(factory)
		} else {
			factory = definition[definition.length - 1]
			dependencies = definition.slice(0, -1)
		}
		if (typeof factory != 'function') {
			throw new Error(`Factory function is not function`)
		}

		if (/^\s*class\s+/.test(factory.toString())) {
			const _factory = factory
			factory = function(...args) {
				return new _factory(...args)
			}
		}

		return Promise.all(dependencies).map((dep) => {
			return this.resolve(dep)
		}).then((deps) => {
			return factory.apply(ctx || factory, deps);
		})
	}

	lookup(patterns, options = {}) {
		let globAsync = Promise.promisify(multiGlob.glob)
		return globAsync(patterns, options).map((file) => {
			return lookup.lookupFile(file).map((module) => {
				this.register(module.name, module.factory)
				return module.name
			}).then((modules) => {
				return {
					file: file,
					modules: modules
				}
			})
		})
	}

}

module.exports = Container
