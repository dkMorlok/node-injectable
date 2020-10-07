class Foo {
	/**
	 * @injectable(foo)
	 */
	constructor() {
	}
}
exports.Foo = Foo

const events_1 = require("events")
class Bar extends events_1.EventEmitter {
	/**
	 * @injectable(bar)
	 */
	constructor() {
		super()
	}
}
exports.BarBar = Bar
