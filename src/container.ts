import { extractDependencies, checkDependencies } from './helpers'
import { Module } from './module'
import { lookupFile } from './lookup'
import { globAll } from './glob'

export class Container {

	private modules: Map<string, Module> = new Map()

	get<T>(name: string): T {
		return this.resolve(name)
	}

	has(name: string): boolean {
		return this.modules.has(name)
	}

	add<T>(name: string, service: T): Container {
		if (this.has(name)) {
			throw new Error(`Module ${name} already registered`)
		}
		this.modules.set(name, Module.resolved(name, service))
		return this
	}

	set<T>(name: string, service: T): Container {
		this.modules.set(name, Module.resolved(name, service))
		return this
	}

	remove(name: string): Container {
		if (!this.modules.has(name)) {
			throw new Error(`Module ${name} not exists`)
		}
		this.modules.delete(name)
		return this
	}

	register<T>(name: string, factory: any, dependencies?: string[]): void {
		if (this.has(name)) {
			throw new Error(`Module ${name} already registered`)
		}
		if (!factory || typeof factory !== 'function') {
			throw new Error(`Factory param is not function. Got ${typeof factory}`)
		}
		if (!dependencies) {
			dependencies = extractDependencies(factory)
		}

		if (/^\s*class\s+/.test(factory.toString())) {
			const _factory = factory
			factory = (...args) => {
				return new _factory(...args)
			}
		}

		this.modules.set(name, new Module(name, factory, dependencies))
	}

	resolve<T>(name): T {
		if (!this.has(name)) {
			throw new Error(`Missing module ${name}`)
		}

		const module = this.modules.get(name)
		if (module.state == 'resolved') {
			return module.resolved
		} else if (module.state == 'resolving') {
			throw new Error(`Module ${name} has cyclic dependency`)
		}

		if (module.dependencies) {
			const path = [name]
			try {
				checkDependencies(this.modules, path)
			} catch (err) {
				throw new Error(`Module ${path.join(' -> ')} cause error ${err}`)
			}
		}

		module.state = 'resolving'
		const deps = module.dependencies.map(dep => this.resolve(dep))
		module.resolved = module.factory.apply(module.factory, deps)
		module.state = 'resolved'

		return module.resolved
	}

	inject<T>(factory: any, dependencies?: string[]): T {
		if (!factory || typeof factory !== 'function') {
			throw new Error(`Factory param is not function. Got ${typeof factory}`)
		}
		if (!dependencies) {
			dependencies = extractDependencies(factory)
		}

		const deps = dependencies.map(dep => this.resolve(dep))

		if (/^\s*class\s+/.test(factory.toString())) {
			return new factory(...deps)
		} else {
			return factory.apply(factory, deps)
		}
	}

	lookup(patterns: string | string[]): Promise<FileDefinitions[]> {
		return globAll(patterns).then((files) => {
			return Promise.all(files.map(file => this.lookupFile(file)))
		})
	}

	async lookupFile(file: string): Promise<FileDefinitions> {
		const definitions = await lookupFile(file)
		for (const definition of definitions) {
			this.register(definition.name, definition.factory, definition.dependencies)
		}
		return {
			file: file,
			definitions: definitions.map(def => def.name),
		}
	}

}

export interface FileDefinitions {
	file: string
	definitions: string[]
}
