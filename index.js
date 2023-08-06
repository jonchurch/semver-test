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
