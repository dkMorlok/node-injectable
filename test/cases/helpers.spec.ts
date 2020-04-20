import { extractDependencies } from '../../src/helpers'

describe('Helpers', () => {

	describe('#extractDependencies', () => {
		test('should parse args names', () => {
			const deps = extractDependencies(function (foo, bar) {})
			expect(deps).toStrictEqual(['foo', 'bar'])
		})

		test('should parse args names', () => {
			const deps = extractDependencies((foo, bar) => {})
			expect(deps).toStrictEqual(['foo', 'bar'])
		})
	})

})
