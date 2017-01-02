module.exports.createOther = function () {
	return 'other'
}

/**
 * @injectable('warrior.jedi1', ['warrior','light'])
 */
module.exports.createJediOne = function () {
	return {
		name: 'yoda',
		weapon: 'green saber',
		force: 'light'
	}
}

/**
 * @injectable('warrior.jedi2', ['warrior','light'])
 */
module.exports.createJediTwo = function () {
	return {
		name: 'windu',
		weapon: 'purple saber',
		force: 'light'
	}
}

/**
 * @injectable('warrior.vader', ['warrior','dark'])
 */
module.exports.createVader = function () {
	return {
		name: 'darth vader',
		weapon: 'red saber',
		force: 'dark'
	}
}

/**
 * @injectable('side.light')
 * @param warriors @injectAll(['warrior','light'])
 */
module.exports.createLightSide = function (warriors) {
	return {
		type: 'light',
		warriors: warriors
	}
}

/**
 * @injectable('side.dark')
 * @param warriors @injectAll(['warrior','dark'])
 */
module.exports.createDarkSide = function (warriors) {
	return new Promise((resolve, reject) => {
		resolve({
			type: 'dark',
			warriors: warriors
		})
	})
}

/**
 * @injectable('fighters.case1')
 * @param light @inject('side.light')
 * @param dark @inject('side.dark')
 */
module.exports.createFighters = function (light, dark) {
	return {
		light: light,
		dark: dark
	}
}

/**
 * @injectable('fighters.case2')
 * @param sides @injectAll(['side.*'])
 */
module.exports.createFighters = function (sides) {
	return {
		light: sides.find((side) => {
			return side.type == 'light'
		}),
		dark: sides.find((side) => {
			return side.type == 'dark'
		})
	}
}
