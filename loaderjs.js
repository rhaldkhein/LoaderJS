// Imports
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
