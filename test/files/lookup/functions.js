// skipped inject of prop
module.exports.skipped = 'skipper'

// skipped inject of not-annotated function
module.exports.createSkipped = function () {
	return 'skipper'
}

// @injectable(joda)
module.exports.createJediOne = function () {
	return 'joda'
}

// @injectable(windu)
module.exports.createJediTwo = function () {
	return 'windu'
}

// @injectable()
module.exports.createWarriors1 = function (jedi1, jedi2) {
	return [jedi1, jedi2]
}

// @injectable(warriors2 joda,windu)
module.exports.createWarriors2 = function (jedi1, jedi2) {
	return [jedi1, jedi2]
}

/**
 * @injectable(warriors3)
 * @param {String} jedi1 @inject(joda)
 * @param {String} jedi2 @inject(windu)
 */
module.exports.createWarriors3 = function (jedi1, jedi2) {
	return [jedi1, jedi2]
}
