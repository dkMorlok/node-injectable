export class Module {
	name: string
	factory?: any
	dependencies?: Array<any>
	state?: 'resolved' | 'resolving'
	resolved?: any

	constructor(name: string, factory?: any, dependencies?: Array<any>) {
		this.name = name
		this.factory = factory
		this.dependencies = dependencies
	}

	static resolved(name: string, object: any) {
		const module = new Module(name)
		module.resolved = object
		module.state = 'resolved'
		return module
	}
}
