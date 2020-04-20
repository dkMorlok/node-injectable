export class Module {
	name: string
	factory?: any
	dependencies?: Array<any>
	state?: 'resolved' | 'resolving'
	resolvingPromise?: any
	exported?: any

	constructor(name: string, factory?: any, dependencies?: Array<any>) {
		this.name = name
		this.factory = factory
		this.dependencies = dependencies
	}

	static resolved(name, exported) {
		const module = new Module(name)
		module.exported = exported
		module.state = 'resolved'
		return module
	}
}
