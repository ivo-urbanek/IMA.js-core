var gulp = require('gulp');
var eslint = require('gulp-eslint');
var karma = require('gulp-karma');

module.exports = function(files) {
	gulp.task('devTest', function() {

		return gulp.src(files.test.src)
			.pipe(karma({
				configFile: './karma.conf.js',
				action: 'watch'
			}))
			.on('error', function(err) {
				throw err;
			});
	});

	gulp.task('test', function() {
		// Be sure to return the stream
		return gulp.src(files.test.src)
			.pipe(karma({
				configFile: './karma.conf.js',
				action: 'run'
			}))
			.on('error', function(err) {
				// Make sure failed tests cause gulp to exit non-zero
				throw err;
			});
	});

	gulp.task('lint', function () {
		return gulp.src(files.app.src)
			.pipe(eslint())
			.pipe(eslint.format())
			.pipe(eslint.failOnError());
	});
}