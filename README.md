# node-injectable

[![Build Status](https://travis-ci.org/dkMorlok/node-injectable.svg?branch=master)](https://travis-ci.org/dkMorlok/node-injectable)
[![Coverage Status](https://coveralls.io/repos/github/dkMorlok/node-injectable/badge.svg)](https://coveralls.io/github/dkMorlok/node-injectable)
[![npm version](https://badge.fury.io/js/node-injectable.svg)](https://badge.fury.io/js/node-injectable)

A simple library for dependency injection with support for ES6 generators. For more information about this pattern look at:
[Dependency injection](http://en.wikipedia.org/wiki/Dependency_injection) and [Inversion of control](http://en.wikipedia.org/wiki/Inversion_of_control).

- supports ES6 classes
- supports async functions
- working with Typescript


## Migration from v2

- Project was completely rewrite to Typescript.
- `resolve` no longer returns Promise.
- added method `get` as alias to `resolve`.


## Install

```
$ npm install node-injectable --save
```


## Usage

Let’s take a look to the recommended usage and APIs of Injectable:

### Step1: Declare factories with some dependencies

```js
/**
 * @injectable(foo)
 */
module.exports.createFoo = function() {
    return "foo"
}

/**
 * @injectable(bar)
 */
module.exports.createBar = function(foo) {
    return foo + "bar"
}
```

### Step2: Create a Container a tell him where are your dependencies

```js
import { Container } from "node-injectable"

const container = new Container()
container.lookup(['src/**/*.js']).then(() => {
    container.get('foo') // "foo"
    container.get('bar') // "foobar"
})
```
- `lookup` scan files you want and automatically register all services
- `lookup` can found only exported services


## Annotations

There is several ways how to annotate modules, functions and classes. In general if you want to register module, function or class
automatically by annotations you must provide **@injectable(NAME)** in comment.

### Resolve by parameter

Your module will be registered as `bar` and have 2 dependencies `dep1` and `dep2` .
```js
/**
 * @injectable(logger)
 */
module.exports = function(dep1, dep2) {}
```

### Resolve by name

You can specify name of services to inject.
```js
/**
 * @injectable(bar)
 * @param foo @inject(logger)
 * @param bar @inject(request)
 */
module.exports = function(foo, bar) {}
```


## Annotations examples

### `module.exports` functions
```js
/**
 * @injectable(foo)
 */
module.exports.createFoo = function() {
}

/**
 * @injectable(bar)
 */
module.exports.createBar = async function() {
}
```

```js
/**
 * @injectable(foo)
 */
module.exports = function() {
}
```

```js
module.exports = {
    /**
     * @injectable(foo)
     */
    createFoo: function() {
    },

    /**
     * @injectable(bar)
     */
    createBar: async function() {
    }
}
```

### `module.exports` classes
```js
class Foo {
    /**
     * @injectable(foo)
     */
    constructor() {
    }
}
module.exports = Foo
```

```js
class Foo {
    /**
     * @injectable(foo)
     */
    constructor() {
    }
}
module.exports.Foo = Foo
```

### `exports` functions (ES6)

```js
/**
 * @injectable(foo)
 */
exports.createFoo = function() {
}

/**
 * @injectable(bar)
 */
exports.createBar = async function() {
}

/**
 * @injectable(default)
 */
function default_1() {
}
exports.default = default_1
```

### `exports` classes (ES6)

```js
class Foo {
    /**
     * @injectable(foo)
     */
    constructor() {
    }
}
exports.Foo = Foo
```


## Contributing

When submitting your pull-request try to follow those guides:
* https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github
* https://medium.com/@vadimdemedes/making-your-first-contribution-de6576ddb190


## Licence

MIT © Dusan Kmet
