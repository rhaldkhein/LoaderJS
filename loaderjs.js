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

// Variables
var loaders = {};

function sync(collection, callback) {

}

function async(collection, callback) {

}

function makePromise(item) {
	return new Promise(function(resolve, reject) {
		// If item is a function pass the resolve & reject
		if (typeof item === 'function') {
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
			// Check if it's a custom loader that might not deal with element
			if (typeof loader === 'function') {
				setImmediate(function() {
					loader.call(this, resolve, reject);
				});
			} else {
				// Prepare variable for element creation
				var element = document.createElement(loader.tag || _loaderDefaults.tag),
					parent = loader.parent || _loaderDefaults.parent,
					attr = loader.attr || _loaderDefaults.attr;
				// Handle events loaded or error
				element.onload = function() {
					resolve();
				};
				element.onerror = function() {
					reject(url);
				};
				// Export element for manipulation before attaching to parent
				loader.config(element);
				// Inject into document to kick off loading
				element[attr] = item;
				document[parent].appendChild(element);
			}
		}
	});
};


function tasksA(loadFilesA) {
	var i, tasks = [];
	// Populate tasks array.
	for (i = 0; i < loadFilesA.length; i++) {
		tasks.push((function(loadFilesB) {
			if (typeof loadFilesB === 'string' || loadFilesB instanceof String) {
				loadFilesB = [loadFilesB];
			}
			return typeof loadFilesB === 'function' ? loadFilesB : function(callback) {
				async.each(loadFilesB, makePromise, function(err) {
					console.log(arguments);
					callback(err ? true : null);
				});
			};
		}).call(null, loadFilesA[i]));
	}
	// Return an array of functions that loads async.
	return tasks;
};


function load(resources, callback, progress) {
	// Start loading...
	async.series(tasksA(resources), function(err, results) {
		if (!err) {
			// All files have been loaded successfuly.
			// console.log('Loader has loaded successfuly!');
		} else {
			// Display error message.
			// console.log('Error!');
		}
		callback(err);
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
// Export for window
if (typeof window !== 'undefined' && !window.LoaderJS) {
	window.LoaderJS = exports;
}