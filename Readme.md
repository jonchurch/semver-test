# Understanding Pre-Release Semver and NPM ERESOLVE Error
This repository provides a simple example to illustrate how pre-release versions (like canary, beta, etc.) are handled in semantic versioning (semver) and how they can lead to npm dependency resolution errors, specifically the ERESOLVE error.

## Overview
Semantic Versioning (semver) is a versioning system that provides meaning of version numbers in the format of MAJOR.MINOR.PATCH-label. When a pre-release version is used (like canary, alpha, beta, etc.), it's appended to the version as a label.

However, pre-release versions can cause issues during the dependency resolution process. For example, npm uses semver to resolve dependencies, and the introduction of the ERESOLVE error in npm version 7 shows an issue when pre-release versions are included.

## The NPM ERESOLVE Error
The ERESOLVE error can occur during an npm install process when the dependency tree cannot be resolved. This happens when a package requires a version of a dependency that conflicts with the version required by another package.

This error has become more common since the release of npm version 7, which introduced stricter peer dependency resolution. Under these stricter rules, npm throws an ERESOLVE error whenever it encounters an irresolvable peer dependency, whereas previous versions of npm would have automatically installed the highest version of the peer dependency.

Consider this ERESOLVE error. NPM has run into an issue resolving the peer dep of `next@^13.4.6` with `next@13.4.7-canary.1`. 

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR!
npm ERR! While resolving: next-template@0.0.2
npm ERR! Found: next@13.4.7-canary.1
npm ERR! node_modules/next
npm ERR!   next@"13.4.7-canary.1" from the root project
npm ERR!
npm ERR! Could not resolve dependency:
npm ERR! peer next@"^13.4.6" from next-auth@0.0.0-manual.83c4ebd1
npm ERR! node_modules/next-auth
npm ERR!   next-auth@"0.0.0-manual.83c4ebd1" from the root project
npm ERR!
npm ERR! Fix the upstream dependency conflict, or retry
npm ERR! this command with --force or --legacy-peer-deps
npm ERR! to accept an incorrect (and potentially broken) dependency resolution.
```

## The Issue
Consider the example in the index.js file in this repository, using the [`semver`](https://www.npmjs.com/package/semver) package that npm itself uses to resolve deps:

```javascript
const semver = require('semver')

const peerRange = '^12.4.6'
const canary = '12.4.7-canary.1'

// satisfies does not include pre-releases by default
console.log(semver.satisfies(canary, peerRange)) // false
console.log(semver.satisfies('1.1.0-canary', '^1.0.0')) // false

// we have to opt into it
console.log(semver.satisfies(canary, peerRange, {includePrerelease: true})) // true

// a pre-release is seen as below the version it is suffixed to
console.log(semver.satisfies('1.0.0-canary.1', '^1.0.0', {includePrerelease: true})) // false

// seen as > 1.0.9 and < 1.0.10
console.log(semver.satisfies('1.0.10-canary.1', '^1.0.0', {includePrerelease: true})) // true
```

The `semver.satisfies` method by default does not include pre-releases. In order to include them, we have to specifically opt into it using the `includePrerelease: true` option. Even with this option, a pre-release version is seen as below the version it is suffixed to.

This behavior of pre-releases in semver can lead to npm ERESOLVE errors if a dependency or peer dependency range requires a version that a pre-release does not satisfy.

pnpm resolves peer deps and pre-releases differently, installing with pnpm will not lead to the same error. 

## Conclusion

I don't know where it is documented that npm behaves this way. I also don't know if it is just for peer deps. Semver itself requires pre-releases be accounted for in precedence. [See semver spec](https://semver.org/#spec-item-11).

So chock it up to a bug/feature in NPM dep resolution. 

There are some related issues:

* https://github.com/npm/cli/issues/4958
* https://github.com/npm/cli/issues/3666

