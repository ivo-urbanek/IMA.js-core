var gulp = require('gulp');
var concat = require('gulp-concat');
var browserify = require('browserify');
var insert = require('gulp-insert');
var shell = require('gulp-shell');
var source = require('vinyl-source-stream');
var clean = require('gulp-clean');

module.exports = function(files) {
	//build vendor for server and client part
	gulp.task('Es6ToEs5:vendor', shell.task('traceur --out ' + files.vendor.tmp + ' --script ' + files.vendor.watch.join(' ') + '  --modules=commonjs --source-maps=inline'));

	gulp.task('vendor:client', function() {
		return (
			browserify(files.vendor.src, {debug: false, insertGlobals : false, basedir: ''})
				.external('vertx')
				.bundle()
				.pipe(source(files.vendor.name.client))
				//.pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
				.pipe(gulp.dest(files.vendor.dest.client))
		);
	});

	gulp.task('vendor:server', function() {
		return (
			gulp
				.src(files.vendor.src)
				.pipe(concat(files.vendor.name.server))
				//.pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
				.pipe(insert.wrap('module.exports = function(config){', ' return vendor;};'))
				.pipe(gulp.dest(files.vendor.dest.server))
		);
	});

	gulp.task('vendor:clean', function() {
		return gulp.src(files.vendor.tmp, {read: false})
			.pipe(clean());
	});

	// BUILD tasks for watch
	gulp.task('vendor:build', function(callback) {
		return runSequence(
			'Es6ToEs5:vendor',
			['vendor:client', 'vendor:server'],
			'vendor:clean',
			'server:restart',
			'server:reload',
			callback
		);
	});
}
