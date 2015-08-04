var gulp = require('gulp');
var less = require('gulp-less');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
var path = require('path');

module.exports = function(files) {

	gulp.task('less', function() {
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
}