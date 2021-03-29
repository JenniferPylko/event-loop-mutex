# event-loop-mutex

This module acts similar to a traditional mutex, but within the JavaScrip event loop. The lock/unlock functionality can be used to guard async execution that is interrupted by an `await`. There are 3 ways to use this module: with async/await, with callbacks, and with for-await.

### Construction

To create or access a mutex instance, construct it with `new Mutex(handle)`. All mutexes with the same handle refer to the same instance.

To create an instance guaranteed to be unique and reuse the instance itself, construct the mutex with `new Mutex(Symbol())`.

### Async/await usage

```js
const Mutex = require("event-loop-mutex")
// ...
const unlock = await new Mutex("unique_handle").lock()
// sensitive code here
unlock()
```

### Callback usage

```js
const Mutex = require("event-loop-mutex")
// ...
new Mutex("unique_handle").lock().then((unlock) => {
    // sensitive code here
    unlock()
    // more code, potentially
})
```

### For-await usage

```js
const Mutex = require("event-loop-mutex")
// ...
for await (const unlock of new Mutex("unique_handle")) {
    // sensitive code here
    unlock()
    // more code, potentially
}
```

### Error handling

If the code guarded by the mutex could potentially throw an error, include an `unlock()` in a `finally` clause.

```js
const Mutex = require("event-loop-mutex")
// ...
const unlock = await new Mutex("unique_handle").lock()
try {
    // sensitive code here
    unlock()
    // more code, potentially
} catch (error) {
    // error handling
} finally {
    unlock()
}
```

### Mutex.defer()

`Mutex.defer()` is a static method that simply returns a promise that resolves at the end of the current event queue. It's equivalent to `new Promise(setImmediate)` or `new Promise(setTimeout)` depending on whether the code is running in Node or a browser.

### Notes

* It is _extremely important_ that .lock() is not called in such a way that it could deadlock the application. If that's unavoidable, a timeout mechanism may need to be implemented in the application to unlock all acquired locks as a last resort.
* This package does not have anything to do with threads, and will not work with Node's cluster functionality or any other method of using threads in Node.

### Compatibility

This module requires the following features:

* `Symbol`
* `Symbol.asyncIterator`
* `Symbol.toStringTag`
* `Promise`
* classes
* class members
* static class members
* getters
* `async`/`await`
* `const`
* CommonJS `module.exports`