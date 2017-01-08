const FN_ARGS = /(function|constructor)\s*[^\(]*\(\s*([^\)]*)\)/m;
const FN_ARG_SPLIT = /,/;
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

module.exports = {

	extractDependencies: function (fn) {
		if (typeof fn !== 'function' || !fn.length) {
			return []
		}

		let srcFn = fn.toString()
		// get rid of comments like function(/*string*/ a) {}
		srcFn = srcFn.replace(STRIP_COMMENTS, '')

		let matches = srcFn.match(FN_ARGS)
		return matches[2].split(FN_ARG_SPLIT).map((arg) => {
			return arg.trim()
		})
	},

	checkDependencies: function (modules, path) {
		let module = modules.get(path[path.length-1])
		for (let i = 0; i < module.dependencies.length; i++) {
			let dep = module.dependencies[i]
			if (!modules.has(dep)) {
				throw new Error(`Module ${module.name} has missing dependency ${dep}`)
			}
			if (path.indexOf(dep) >= 0) {
				throw new Error(`Module ${module.name} has cyclic dependency on ${dep}`)
			}
			path.push(dep)
			this.checkDependencies(modules, path)
			path.pop()
		}
	}

}
