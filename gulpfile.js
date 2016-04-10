var gulp = require('gulp'),
	exec = require('child_process').exec,
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	webpack = require('webpack-stream');

gulp.task('default', ['test_q']);

gulp.task('bundle', function() {
	return gulp.src('loaderjs.js')
		.pipe(webpack(require('./webpack.config.js')))
		.pipe(gulp.dest(''));
});

gulp.task('compress', ['bundle'], function() {
	return gulp.src('loaderjs.bundle.js')
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(''));
});

gulp.task('test', function() {
	require('./test');
});

gulp.task('test_q', function() {
	require('./test/q');
});