var gulp = require('gulp');
var eslint = require('gulp-eslint');

module.exports = function(files) {
	gulp.task('lint', function () {
		return gulp.src(files.app.src)
			.pipe(eslint())
			.pipe(eslint.format())
			.pipe(eslint.failOnError());
	});
}