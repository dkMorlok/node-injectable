# node-injectable

[![Build Status](https://travis-ci.org/dkMorlok/node-injectable.svg?branch=master)](https://travis-ci.org/dkMorlok/node-injectable)
[![Coverage Status](https://coveralls.io/repos/github/dkMorlok/node-injectable/badge.svg)](https://coveralls.io/github/dkMorlok/node-injectable)
[![npm version](https://badge.fury.io/js/node-injectable.svg)](https://badge.fury.io/js/node-injectable)

A simple library for dependency injection with support for ES6 generators. For more information about this pattern look at:
[Dependency injection](http://en.wikipedia.org/wiki/Dependency_injection) and [Inversion of control](http://en.wikipedia.org/wiki/Inversion_of_control).


## Install

```
$ npm install node-injectable --save
```


## Usage

Let’s take a look to the recommended usage and APIs of Injectable:

### Step1: Declare factories with some dependencies

```js
// @injectable(foo)
module.exports.createFoo = function() {
  return "foo"
}

// @injectable(bar)
module.exports.createBar = function(foo) {
  return new Promise((resolve, reject) => {
    resolve(foo + "bar")
  })
}
```

### Step2: Create a Container a tell him where your dependencies are

```js
let injectable = require('node-injectable')
let container = new injectable.Container()
container.lookup(['src/**/*.js']).then(() => {
  container.resolve('foo').then((foo) => {
    console.log(foo) // print "foo"
  })
  container.resolve('bar').then((bar) => {
    console.log(bar) // print "foobar"
  })
})
```


## Annotations

There is several ways how to annotate modules even ES6 classes. In general if you want to register module or class
automatically by annotations you must provide **@injectable(NAME)** in comment. 

### Exporting functions

Your module will be registered as `bar` and have 2 dependencies `dep1` and `dep2` .
```js
// @injectable(bar)
module.exports = function(dep1, dep2) {}
```

You can specify better names than `dep1` or `dep2` with extra annotations.
```js
// @injectable(bar logger,request)
module.exports = function(dep1, dep2) {}
```

In some cases you can have many dependencies, than you can use annotation **@inject(NAME)** for each injected dep. 
Can’t be combined with previous one. Order of @inject matters when container resolving dependencies.
```js
/**
 * @injectable(bar)
 * @inject(logger)
 * @inject(request)
 */
module.exports = function(dep1, dep2) {}
```

Module can export many functions or factories. Injectable lookup for every exported function with `@injectable`.
```js
// @injectable(foo)
module.exports.createFoo() {}

// @injectable(bar)
module.exports.createBar() {}

// this method is not registered
module.exports.createSomething() {}
```

Also this format of export is supported with `@injectable`
```js
module.exports = {
  // @injectable(foo)
  createFoo: function() {},
  
  // @injectable(bar)
  createBar: function() {},
  
  // this method is not registered
  createSomething: function() {}
}
```

### Exporting classes

Same way as you exporting methods, you can export a classes with annotations on constructor.

```js
class MyLogger {
	// @injectable(logger, writers.logdna)
	constructor(writer) {
		this.writer = writer
	}
}
module.exports = MyLogger 
```

if you prefer multi-line comments:
```js
class MyLogger {
	/**
	 * @injectable(logger)
	 * @inject(writers.logdna) 
	 */
	constructor(writer) {
		this.writer = writer
	}
}
module.exports = MyLogger 
```


## Contributing

When submitting your pull-request try to follow those guides:
* https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github
* https://medium.com/@vadimdemedes/making-your-first-contribution-de6576ddb190


## Licence

MIT © Dusan Kmet
