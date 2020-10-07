import { parseFile } from './parsing'

export interface Definition {
	name: string
	factory: any
	dependencies: string[] | null
}

export async function lookupFile(file: string): Promise<Definition[]> {
	const result = await parseFile(file)
	return result.filter((funct) => {
		return funct.annotations.hasOwnProperty('injectable')
	}).map((funct) => {
		return createFunctDefinition(funct)
	})
}

export function createFunctDefinition(funct): Definition {
	const definition: Definition = {
		name: funct.name,
		factory: funct.ref,
		dependencies: null,
	}
	if (!funct.annotations['injectable'][0]) {
		return definition
	}

	const injectable = funct.annotations['injectable'][0].split(' ')
	definition.name = injectable[0]
	if (injectable.length == 2) {
		definition.factory = funct.ref
		definition.dependencies = injectable[1].split(',')
	} else if (funct.annotations.hasOwnProperty('inject')) {
		definition.factory = funct.ref
		definition.dependencies = funct.annotations.inject
	}

	return definition
}
