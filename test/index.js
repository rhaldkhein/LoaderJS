var loaderjs = require('../loaderjs');

loaderjs.addLoader({
	// The associated extensions.
	ext: 'xxx,yyy',
	// The element to create.
	tag: 'link',
	// Where should the element be placed (head or body).
	parent: 'head',
	// Which attribute in the element should the filename be placed (href or src).
	attr: 'href',
	// This method is called before the element is appended to parent.
	config: function(element) {
		// Place your addition statement here.
	}
});

// Startup - Loading css, javascript, html, images
loaderjs.load(['file.jsx'], function(err, percent) {
	if (percent < 100) {
		// Still loading
	} else {
		// Loaded
	}
});
