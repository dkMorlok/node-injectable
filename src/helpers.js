const FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
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
		return matches[1].split(FN_ARG_SPLIT).map((arg) => {
			return arg.trim()
		})
	},

	detectCycle: function (modules, path) {
		let module = modules.get(path[path.length-1])
		for (let i = 0; i < module.dependencies.length; i++) {
			let dep = module.dependencies[i]
			if (path.indexOf(dep) >= 0) {
				path.push(dep)
				return true
			} else {
				path.push(dep)
				if (this.detectCycle(modules, path)) {
					return true
				} else {
					path.pop()
				}
			}
		}
		return false
	}

}
