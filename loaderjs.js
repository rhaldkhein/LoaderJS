// Imports
var isWindow = typeof window !== 'undefined';
var Promise = (isWindow && window.Promise) ? window.Promise : require('es6-promise').Promise; // With promise polyfill
var setImmediate = isWindow && window.setImmediate ? window.setImmediate : (function() {
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

function makeLoadPromise(item) {
	return new Promise(function(resolve, reject) {
		if (item instanceof Promise) {
			reject();
		} else if (typeof item === 'function') {
			// If item is a function pass the resolve & reject
			setImmediate(function() {
				item.call(this, resolve, reject);
			});
		} else {
			// Prepare variables
			var regexExt = /(?:\.([^.]+))?$/,
				ext = regexExt.exec(item)[1],
				loader = loaders[ext] || (function() {
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
					reject(item);
				};
				// Export element for manipulation before attaching to parent
				loader.config(element);
				// Inject into document to kick off loading
				element[attr] = item;
				document[parent].appendChild(element);
			}
		}
	});
}


function makeLoadAsyncPromise(items) {
	return new Promise(function(resolve, reject) {
		if (typeof items === 'string' || items instanceof String) {
			// String, converting to array of promises by calling makeLoadPromise function
			items = [makeLoadPromise(items)];
		} else if (typeof items === 'function') {
			// Function, converting to array promises
			items = [makeLoadPromise(items)];
		} else {
			// A valid array of strings or functions, converting to array of promises
			for (i = 0; i < items.length; i++) {
				items[i] = makeLoadPromise(items[i]);
			}
		}
		// At this point we should have array of promises
		Promise.all(items).then(resolve).catch(reject);
	});
}


function load(resources, callback, progress) {
	if (!resources.length > 0) {
		return;
	}
	var result = [],
		prom = makeLoadAsyncPromise(resources[0]);
	resources.forEach(function(item) {
		if (item !== resources[0]) {
			prom = prom.then(function(data) {
				result.push(data);
				return makeLoadAsyncPromise(item);
			});
		}
	});
	prom.then(function(data) {
		result.push(data);
		callback(false, result);
	}).catch(function(err) {
		callback(true, err);
	});
}

function addLoader(loader) {
	var i, exts = loader.ext.split(',');
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
		el.async = true;
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
// Export for window
if (typeof window !== 'undefined' && !window.LoaderJS) {
	window.LoaderJS = exports;
}