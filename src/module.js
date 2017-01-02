class Module {

	constructor(name, factory, dependencies) {
		this.name = name
		this.factory = factory
		this.dependencies = dependencies
	}

}

module.exports = Module
