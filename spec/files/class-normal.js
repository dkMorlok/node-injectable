class MyLogger {
	constructor() {
		this.prefix = "app:"
	}
	log(message) {
		console.log(this.prefix + message)
	}
}

module.exports = MyLogger
