var gulp = require('gulp');
var less = require('gulp-less');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
var path = require('path');
var runSequence = require('run-sequence');

module.exports = function(files) {

	gulp.task('build:app', function(callback) {
		return runSequence(
			'Es6ToEs5:client',
			'server:restart',
			'server:reload',
			callback
		);
	});

	gulp.task('build:less', function() {
		return (
			gulp.src(files.less.src)
				.pipe(plumber())
				.pipe(sourcemaps.init())
				.pipe(concat({path: files.less.name, base: files.less.base, cwd: files.less.cwd}))
				.pipe(less({compress: true, paths: [ path.join(__dirname) ]}))
				.pipe(autoprefixer())
				.pipe(sourcemaps.write())
				.pipe(plumber.stop())
				.pipe(gulp.dest(files.less.dest))
			);
	});

	gulp.task('build:server', function(callback) {
		return runSequence(
			['copy:imajsServer', 'copy:environment'],
			'Es6ToEs5:server',
			'server:restart',
			'server:reload',
			callback
		);
	});

	gulp.task('build:vendor', function(callback) {
		return runSequence(
			'Es6ToEs5:vendor',
			['vendor:client', 'vendor:server'],
			'vendor:clean',
			'server:restart',
			'server:reload',
			callback
		);
	});

	gulp.task('build:locale', function(callback) {
		return runSequence(
			'locale',
			'server:restart',
			'server:reload',
			callback
		);
	});
}