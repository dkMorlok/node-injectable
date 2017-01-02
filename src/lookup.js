const parser = require('./parser')

module.exports = {

	lookupFile: function(file) {
		return parser(file).then((result) => {
			let functions = []
			if (result.module.annotations.hasOwnProperty('injectable')) {
				functions.push(result.module)
			}
			for (let name in result.functions) {
				functions.push(result.functions[name])
			}
			return functions.filter((funct) => {
				return funct.annotations.hasOwnProperty('injectable')
			}).map((funct) => {
				return this.createFunctDefinition(funct)
			})
		})
	},

	createFunctDefinition: function(funct) {
		let definition = {
			name: funct.name,
			factory: funct.ref
		}
		let injectable = funct.annotations['injectable'][0]
		if (!injectable) {
			return definition
		}
		injectable = injectable.split(' ')
		definition.name = injectable[0]
		if (injectable.length == 2) {
			definition.factory = injectable[1].split(',')
			definition.factory.push(funct.ref)
		} else if (funct.annotations.hasOwnProperty('inject')) {
			definition.factory = funct.annotations.inject
			definition.factory.push(funct.ref)
		}
		return definition
	}

}
