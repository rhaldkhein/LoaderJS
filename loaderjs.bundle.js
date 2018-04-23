/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// Imports
var isWindow = typeof window !== 'undefined';
var setImmediate =
  isWindow && window.setImmediate
    ? window.setImmediate
    : (function() {
        if (typeof process === 'object' && typeof process.nextTick === 'function') {
          return process.nextTick;
        } else {
          return function(fn) {
            setTimeout(fn, 0);
          };
        }
      })();

// Loaders storage
var loaders = {};

function makeLoadPromise(item, increment) {
  var promise = new Promise(function(resolve, reject) {
    if (!item) {
      // Auto resolve if passed a falsy item
      resolve();
    } else if (typeof item.then === 'function') {
      // Promise like object
      if (typeof item.src === 'string') {
        // Object item with props `src` and `then`
        makeLoadPromise(item.src)
          .then(item.then)
          .then(resolve)
          .catch(reject);
      } else {
        // Assume that its really a promise
        item.then(resolve).catch(reject);
      }
    } else if (typeof item === 'function') {
      // If item is a function pass the resolve & reject
      setImmediate(function() {
        item.call(this, resolve, reject);
      });
    } else {
      // Prepare variables
      var regexExt = /(?:\.([^.]+))?$/,
        ext = regexExt.exec(item)[1],
        loader =
          loaders[ext] ||
          (function() {
            throw 'No loader for file ' + ext;
          })();
      if (typeof loader === 'function') {
        setImmediate(function() {
          loader.call(this, resolve, reject, item);
        });
      } else {
        // Prepare variable for element creation
        var element = document.createElement(loader.tag || _loaderDefaults.tag),
          parent = loader.parent || _loaderDefaults.parent,
          attr = loader.attr || _loaderDefaults.attr;
        // Handle events loaded or error
        element.onload = function() {
          resolve(item);
        };
        element.onerror = function() {
          reject('Error while loading ' + item);
        };
        // Export element for manipulation before attaching to parent
        loader.config(element);
        // Inject into document to kick off loading
        element[attr] = item;
        document[parent].appendChild(element);
      }
    }
  });
  if (increment) promise.then(increment);
  return promise;
}

function makeLoadAsyncPromise(items, increment) {
  if (typeof items === 'string' || items instanceof String) {
    // String, converting to array of promises by calling makeLoadPromise function
    items = [makeLoadPromise(items, increment)];
  } else if (typeof items === 'function') {
    // Function, converting to array promises
    items = [makeLoadPromise(items, increment)];
  } else {
    // A valid array of strings or functions, converting to array of promises
    for (var i = 0; i < items.length; i++) {
      items[i] = makeLoadPromise(items[i], increment);
    }
  }
  // At this point we should have array of promises
  return Promise.all(items);
}

function getPercent(current, total) {
  return Math.round(current / total * 100);
}

function load(resources, callback, progress) {
  if (!resources.length > 0) return;

  function increment(result) {
    if (progress && !error) progress(getPercent(counter++, total));
    return result;
  }
  var error = false,
    counter = 0,
    total = resources[0] instanceof Array ? resources[0].length : 1,
    result = callback ? [] : undefined,
    prom = makeLoadAsyncPromise(resources[0], increment);
  resources.forEach(function(item) {
    if (item !== resources[0]) {
      total += item instanceof Array ? item.length : 1;
      prom = prom.then(function(data) {
        if (callback) result.push(data);
        return makeLoadAsyncPromise(item, increment);
      });
    }
  });
  prom
    .then(function(data) {
      if (callback) {
        result.push(data);
        callback(false, result);
      }
    })
    .catch(function(err) {
      error = true;
      if (callback) callback(err);
    });
  increment();
  return prom;
}

function addLoader(loader) {
  var i,
    exts = loader.ext.split(',');
  for (i = exts.length - 1; i > -1; i--) {
    loaders[exts[i]] = 'custom' in loader ? loader.custom : loader;
  }
}

//-----------------------------------------------------------
// Adding predefined loaders
//-----------------------------------------------------------

var _loaderDefaults = {
  tag: 'link',
  parent: 'head',
  attr: 'href'
};

// Javascript
addLoader({
  ext: 'js',
  tag: 'script',
  parent: 'body',
  attr: 'src',
  config: function(el) {
    el.async = false;
  }
});

// Stylesheet
addLoader({
  ext: 'css',
  config: function(el) {
    el.type = 'text/css';
    el.rel = 'stylesheet';
  }
});

// Html
addLoader({
  ext: 'html',
  config: function(el) {
    el.rel = 'import';
  }
});

//-----------------------------------------------------------
// Exports
//-----------------------------------------------------------
// Export for require
exports.load = load;
exports.addLoader = addLoader;
exports.loaders = loaders;
exports.loadOne = makeLoadPromise;
exports.loadMany = exports.loadAsync = makeLoadAsyncPromise;
// Export for window
if (typeof window !== 'undefined' && !window.LoaderJS) {
  window.LoaderJS = exports;
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ })
/******/ ]);