# LoaderJS

A customizable resource loader for web applications. Promise-based asynchronous loading and control flow. Can support any types of files, just create custom loader for your custom files.

Installation:
```sh
// NPM 
npm install loaderjs
```

----------

## Usage

For global window:

```html
<script src="loaderjs.bundle.min.js" type="text/javascript">
<script type="text/javascript">
	// `LoaderJS` will be exposed to global `window`
	LoaderJS.load([...]);
</script>
```

For Webpack or Browserify:

```javascript
// Import
var LoaderJS = require('loaderjs');
// Start loading
LoaderJS.load([...]);
```

### LoaderJS.load(resources [, callback]) -> Promise

To start loading resources, just call `LoaderJS.load(resource, callback)`, where **resource** is a 2-dimensional array of possible **items**, and optional **callback** function with parameters `function(err, data){}`. Returns `Promise`.

The **resource** collection must be a 2-Dimensional array.
 - 1st level is `SEQUENCE` loading. Waits for the preceding element to finish.
 - 2nd level is `PARALLEL` loading. Does not wait, loads immediately.

The **items** can be.
 - String `url` (like value of src attribute)
 - Promise
 - Promise's `resolver` function - `function(resolve, reject) {...}`
 - Object with `src` and `then` property - `{ src: 'file.js', then: function() {...} }`
 - Any falsy value, which will auto resolve - `null or undefined or etc.`

The **callback** function is triggered when loading is completely done or loader encounters error while loading.
 - Check the `err` to see the status result
 - The `data` argument an **array** that contains the data passed by **each** loaders

> LoaderJS currently contains predefined loaders for file **JS**, **CSS**, **HTML** (WebComponent).
> You can always create your own loaders to suits your needs.

Example Code:

```javascript
var resA = [];
// dummy-scriptA will always finish & execute first, than dummy-scriptB.
resA.push('dummy/dummy-scriptA.js');
//dummy-img will load along with dummy-scriptA.
resA.push('dummy/dummy-img.gif');
// A promise
resA.push(new Promise())
// A promise resolver
resA.push(function(resolve, reject) {})
// Object
resA.push({
  src: 'dummy/big-file.js',
  then: function() {
    // Called when done loading big-file.js
    // You can also return a promise and loader wait for it to fulfil
    return client.init() // Assume init() returns a promise
  }
})

var resB = [];
// dummy-scriptB might finish last after dummy-css. Parallel loading
resB.push('dummy/dummy-scriptB.js');
// dummy-css might finish first than dummy-scriptB. Parallel loading
resB.push('dummy/dummy-css.css');

var resC = 'dummy/dummy-480x270-FairyLights.jpg';

// Start loading resources
LoaderJS.load([resA, resB, resC], function(err, data) {
    var el = document.getElementById("loader");
    if(!err){
	    console.log('All Loaded!', data);
    } else {
	    console.log('Ouch!', data);
    }
});
```
### LoaderJS.loadOne(resource) 
Loads a single resource. Returns `Promise`.
### LoaderJS.loadMany(resources)
Loads multiple resources in parallel (1-dim array only). Returns `Promise`.

----------

## Customize

To add custom loaders, just call `LoaderJS.addLoader(loader)` where **loader** is an object must contain a property "**ext**" to associate the loader to a file(s).

There are 2 main types of custom loader:
1. Loader that **uses** element to load files. (eg. js, css, html)
2. Loader that does **not use** element to load files. (eg. jpg, png, gif, etc...)

**Type 1**: Load with element

```javascript
// Javascript Loader
LoaderJS.addLoader({
	ext: 'js', // Associated file. Can be multiple, split by comma
	tag: 'script', // The element that will be created
	parent: 'body', // The parent of the element
	attr: 'src', // The attribute of element where the url will be placed
	// Optional property
	// This is triggered before the element is attached to its parent
	config: function(element) {
		element.async = true;
	}
});

// Stylesheet Loader
LoaderJS.addLoader({
	ext: 'css',
	tag: 'link',
	parent: 'head',
	attr: 'href',
	config: function(element) {
		element.type = 'text/css';
		element.rel = 'stylesheet';
	}
});
```

**Type 2**: Load without element. Add a property "**custom**" with function value.

```javascript
// Custom Loader
LoaderJS.addLoader({
     ext: 'jpg,png',
     custom: function(resolve, reject, url) {
         console.log('Loading Image', url);
         var image = new Image();
         image.onload = function() {
			resolve(image);
		 };
		 image.onerror = function() {
			reject('Unable to load image ' + url);
		 };
         image.src = url;
     }
 });
```

Additionally, you can link more file extensions to existing loader.

```javascript
LoaderJS.addLoader({
	ext: 'gif',
	custom: LoaderJS.loaders['jpg']
});
```

----------

## More...


### Progress Callback

You can also add 3rd argument to `LoadJS.load(res, cb, progress)` which enables to keep track of the progress. The callback will pass the **percentage** of the loading progress.

### License
MIT