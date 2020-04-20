const FN_ARGS = /(function|constructor)?\s*[^\(]*\(\s*([^\)]*)\)/m;
const FN_ARG_SPLIT = /,/;
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

export function extractDependencies(fn): Array<any> {
	if (typeof fn !== 'function') {
		throw new Error(`Invalid param, expected function got ${typeof fn}`)
	}
	if (fn.length === 0) {
		return []
	}

	let srcFn = fn.toString()
	// get rid of comments like function(/*string*/ a) {}
	srcFn = srcFn.replace(STRIP_COMMENTS, '')

	const matches = srcFn.match(FN_ARGS)
	if (!matches) {
		throw new Error('Unable to parse function args')
	}
	return matches[2].split(FN_ARG_SPLIT).map(arg => arg.trim())
}

export function checkDependencies(modules, path): void {
	const module = modules.get(path[path.length-1])
	for (let i = 0; i < module.dependencies.length; i++) {
		const dep = module.dependencies[i]
		if (!modules.has(dep)) {
			throw new Error(`Module ${module.name} has missing dependency ${dep}`)
		}
		if (path.indexOf(dep) >= 0) {
			throw new Error(`Module ${module.name} has cyclic dependency on ${dep}`)
		}
		path.push(dep)
		checkDependencies(modules, path)
		path.pop()
	}
}
