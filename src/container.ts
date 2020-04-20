import { glob } from 'multi-glob'
import { extractDependencies, checkDependencies } from './helpers'
import { Module } from './module'
import { lookupFile } from './lookup'
import { promisify } from 'util'

const globAsync = promisify(glob)

export class Container {

	private modules: Map<string, Module> = new Map()
	private resolving: Set<string> = new Set()

	add<T>(name: string, service: T): void {
		if (this.has(name)) {
			throw new Error(`Module ${name} already registered`)
		}
		this.modules.set(name, Module.resolved(name, service))
	}

	get(name: string): Module | null {
		return this.modules.get(name) || null
	}

	has(name: string): boolean {
		return this.modules.has(name)
	}

	remove(name: string): void {
		if (!this.modules.has(name)) {
			throw new Error(`Module ${name} not exists`)
		}
		this.modules.delete(name)
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

	async resolve<T>(name): Promise<T> {
		if (!this.has(name)) {
			throw new Error(`Missing module ${name}`)
		}

		const module = this.modules.get(name)
		if (module.state == 'resolved') {
			return module.exported
		}
		if (module.state == 'resolving') {
			return module.resolvingPromise;
		}

		const path = [module.name]
		try {
			checkDependencies(this.modules, path)
		} catch (err) {
			throw new Error(`Resolving module ${path.join(' -> ')} cause error ${err}`)
		}

		this.resolving.add(name)
		module.state = 'resolving'
		module.resolvingPromise = Promise.all(module.dependencies.map((dep) => {
			return this.resolve(dep)
		})).then((deps) => {
			this.resolving.delete(name)
			const exported = module.factory.apply(module.factory, deps)
			module.state = 'resolved'
			module.exported = exported
			return exported
		})

		return module.resolvingPromise
	}

	async inject<T>(factory: any, dependencies?: string[]): Promise<T> {
		if (!factory || typeof factory !== 'function') {
			throw new Error(`Factory param is not function. Got ${typeof factory}`)
		}
		if (!dependencies) {
			dependencies = extractDependencies(factory)
		}

		if (/^\s*class\s+/.test(factory.toString())) {
			const _factory = factory
			factory = (...args: any[]) => {
				return new _factory(...args)
			}
		}

		const deps = await Promise.all(dependencies.map(dep => this.resolve(dep)))
		return factory.apply(factory, deps)
	}

	async lookup(patterns: string | string[]): Promise<FileDefinitions[]> {
		const files = await globAsync(patterns)
		return Promise.all(files.map(file => this.lookupFile(file)))
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
