// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
	testEnvironment: "node",
	testPathIgnorePatterns: [
		"<rootDir>/node_modules/",
	],
	transform: {
		"^.+\\.tsx?$": "ts-jest"
	},
	testPathIgnorePatterns: [
		"/node_modules/",
	],
	coverageReporters: [
		"lcov",
		"text",
		"text-summary",
	],
	coveragePathIgnorePatterns: [
		'<rootDir>/node_modules',
		'<rootDir>/test',
	],
}
