var isWindow = typeof window !== 'undefined';
var Promise = (isWindow && window.Promise) ? window.Promise : require('es6-promise').Promise;

var promA = new Promise(function(resolve, reject) {
	console.log('Promise A');
	// reject('Error A!');
	// resolve('Ok A!');
	setTimeout(function() {
		resolve('Ok A!');
	}, 2000);
});

var promB = new Promise(function(resolve, reject) {
	console.log('Promise B');
	// reject('Error B!');
	resolve('Ok B!');
});

var promC = new Promise(function(resolve, reject) {
	console.log('Promise C');
	// reject('Error C!');
	resolve('Ok C!');
});

// var promises = [promA, promC, promB];
var promises = [promA, promB, promC];
var result = promises[0];
promises.forEach(function(prom) {
	result = result.then(function(msg) {
		// console.log('Then ' + msg);
		return prom;
	});
});
result.then(function(msg) {
	// console.log('Then ' + msg);
	console.log('All promises fulfilled!');
}).catch(function(err) {
	console.log(err);
});