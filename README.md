# node-injectable

[![Build Status](https://travis-ci.org/dkMorlok/node-injectable.svg?branch=master)](https://travis-ci.org/dkMorlok/node-injectable)
[![Coverage Status](https://coveralls.io/repos/github/dkMorlok/node-injectable/badge.svg)](https://coveralls.io/github/dkMorlok/node-injectable)
[![npm version](https://badge.fury.io/js/node-injectable.svg)](https://badge.fury.io/js/node-injectable)

A simple library for dependency injection with support for ES6 generators. For more information about this pattern look at:
[Dependency injection](http://en.wikipedia.org/wiki/Dependency_injection) and [Inversion of control](http://en.wikipedia.org/wiki/Inversion_of_control).


## Install

`$ npm install --save node-injectable`

## Examples

You can use annotations to automatically setup Container
```js
// src/modules-foo.js
module.export = {
  /**
   * @injectable(foo)
   */
  createFoo: function() {
    return "foo"
  }
}

// src/modules-bar.js
module.export = {
  /**
   * @injectable(bar)
   */
  createBar: function(foo) {
    return foo + "bar"
  }
}

// index.js
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

Or container can be setup manualy
```js
let injectable = require('node-injectable')
let container = new injectable.Container()
container.register('foo', function() {
  return "foo"
})
container.register('bar', function(foo) {
  return foo + "bar"
})

container.resolve('foo').then((foo) => {
  console.log(foo) // print "foo"
})
container.resolve('bar').then((bar) => {
  console.log(bar) // print "foobar"
})
```


## Contributing

When submitting your pull-request try to follow those guides:
* https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github
* https://medium.com/@vadimdemedes/making-your-first-contribution-de6576ddb190


## Licence

MIT © Dusan Kmet
