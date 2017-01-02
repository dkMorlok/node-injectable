module.exports.createOther = function () {
	return 'other'
}

/**
 * @injectable(joda)
 */
module.exports.createJediOne = function () {
	return 'joda'
}

/**
 * @injectable(windu)
 */
module.exports.createJediTwo = function () {
	return 'windu'
}

/**
 * @injectable(warriors1)
 * @param {String} jedi1 @inject(joda)
 * @param {String} jedi2 @inject(windu)
 */
module.exports.createWarriors1 = function (jedi1, jedi2) {
	return [jedi1, jedi2]
}

/**
 * @injectable()
 */
module.exports.createWarriors2 = function (joda, windu) {
	return [joda, windu]
}

/**
 * @injectable(warriors3 joda,windu)
 */
module.exports.createWarriors3 = function (jedi1, jedi2) {
	return [jedi1, jedi2]
}
