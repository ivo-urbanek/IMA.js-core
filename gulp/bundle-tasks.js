var gulp = require('gulp');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var clean = require('gulp-clean');
var gulpCommand = require('gulp-command')(gulp);

module.exports = function(files) {
	// -------------------------------------PUBLIC TASKS (gulp task)
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

	gulp.task('bundle:css', function() {
		return (
			gulp.src(files.bundle.css.src)
				.pipe(plumber())
				.pipe(concat(files.bundle.css.name))
				.pipe(minifyCSS())
				.pipe(plumber.stop())
				.pipe(gulp.dest(files.bundle.css.dest))
		);
	});

	
	gulp.task('bundle:clean', function() {
		return (
			gulp.src(files.bundle.css.src.concat(files.bundle.js.src), {read: false})
				.pipe(clean())
		);
	});
}