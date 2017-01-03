class NotAnnotatedClass {
	constructor(name) {
		this.name = name
	}
	print() {
		console.log(this.name)
	}
}

class MyLogger {
	/**
	 * @injectable(logger)
	 */
	constructor() {
		this.prefix = "app:"
	}
	log(message) {
		console.log(this.prefix + message)
	}
}

class MyDebugger {
	/**
	 * @injectable(debugger)
	 * @inject(logger)
	 */
	constructor(logger) {
		this.logger = logger
	}
	debug(message) {
		this.logger.log(message)
	}
}

module.exports = {
	NotAnnotatedClass: NotAnnotatedClass,
	MyLogger: MyLogger,
	MyDebugger: MyDebugger
}
