var gulp = require('gulp');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var clean = require('gulp-clean');
var gulpCommand = require('gulp-command')(gulp);

module.exports = function(files) {
	// -------------------------------------PUBLIC TASKS (gulp task)
	gulp.task('dev', function(callback) {
		return runSequence(
			['copy:appStatic', 'copy:imajsServer', 'copy:environment', 'shim', 'polyfill'],
			['Es6ToEs5:client', 'Es6ToEs5:server', 'Es6ToEs5:vendor'],
			['vendor:client', 'vendor:server', 'less', 'doc', 'locale'],
			'vendor:clean',
			['server'],
			['devTest', 'watch'],
			callback
		);
	});

	gulp
		.option('build', '-e, --env', 'Build environment')
		.task('build', function(callback) {

			if (this.flags.env === 'prod') {
				uglifyCompression.global_defs.$Debug = false;
			}
			return runSequence(
				['copy:appStatic', 'copy:imajsServer', 'copy:environment', 'shim', 'polyfill'], //copy folder public, concat shim
				['Es6ToEs5:client', 'Es6ToEs5:server', 'Es6ToEs5:vendor'], // convert app and vendor script
				['vendor:client', 'vendor:server', 'less', 'doc', 'locale'], // adjust vendors, compile less, create doc,
				['bundle:js:app', 'bundle:js:server', 'bundle:css'],
				['vendor:clean', 'bundle:clean'],// clean vendor
				callback
			);
	});

	gulp.task('bundle:js:app', function() {
		return (
			gulp.src(files.bundle.js.src)
				.pipe(plumber())
				.pipe(concat(files.bundle.js.name))
				.pipe(uglify({mangle:true, compress: uglifyCompression}))
				.pipe(plumber.stop())
				.pipe(gulp.dest(files.bundle.js.dest))
		);
	});

	gulp.task('bundle:clean', function() {
		return (
			gulp.src(files.bundle.css.src.concat(files.bundle.js.src), {read: false})
				.pipe(clean())
		);
	});
}