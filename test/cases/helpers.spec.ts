import { extractDependencies } from '../../src/helpers'

describe('Helpers', () => {

	describe('#extractDependencies', () => {
		it('should parse args names', async () => {
			const deps = extractDependencies(function (foo, bar) {})
			expect(deps).toStrictEqual(['foo', 'bar'])
		})

		it('should parse args names', async () => {
			const deps = extractDependencies((foo, bar) => {})
			expect(deps).toStrictEqual(['foo', 'bar'])
		})
	})

})
