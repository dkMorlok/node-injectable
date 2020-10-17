import glob = require('glob')

function array(arr: string | string[]): string[] {
	return Array.isArray(arr) ? arr : [arr]
}

function uniq(xs) {
	return xs.reduce((unique, x) => {
		return unique.indexOf(x) < 0 ? unique.concat(x) : unique
	}, [])
}

function flatten(xs) {
	return xs.reduce((flattened, x) => {
		return flattened.concat(Array.isArray(x) ? flatten(x) : x)
	}, [])
}

function resolve(patterns: string | string[]): Promise<any> {
	return Promise.all(
		array(patterns).map(pattern => new Promise((resolve, reject) => {
			glob(pattern, (err, matches) => {
				if (!err && matches.length === 0) {
					reject(new Error(`'${pattern}' matched no files`))
				} else if (err) {
					reject(err)
				} else {
					resolve(matches)
				}
			})
		})),
	)
}

export function globAll(patterns: string | string[]): Promise<string[]> {
	return resolve(patterns)
		.then(matches => uniq(flatten(array(matches))))
}
