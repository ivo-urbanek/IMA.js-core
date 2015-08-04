var gulp = require('gulp');
var gutil = require('gulp-util');
var	remember = require('gulp-remember');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var cache = require('gulp-cached');
var gulpif = require('gulp-if');
var save = require('gulp-save');
var concat = require('gulp-concat');
var traceur = require('gulp-traceur');
var es = require('event-stream');
var react = require('gulp-react');
var sweetjs = require('gulp-sweetjs');
var insert = require('gulp-insert');
var path = require('path');

/*
* Change path for file
*/
var resolveNewPath = function(newBase){
	return es.mapSync(function (file) {
		var newBasePath = path.resolve(newBase);
		var namespaceForFile = '/' + path.relative(file.cwd + '/' + newBase, file.base) + '/';
		var newPath = newBasePath + namespaceForFile + file.relative;

		file.base = newBasePath;
		file.path = newPath;
		file.cwd = newBasePath;
		return file;
	});
};


module.exports = function(files) {
	gulp.task('Es6ToEs5:client', function() {
		var view = /view.js$/;
		var jsx = /view.jsx$/;

		function isView(file) {
			return !!file.relative.match(view);
		}

		function isJSX(file) {
			return !!file.relative.match(jsx);
		}

		function handleError (error) {
			gutil.log(
				gutil.colors.red('Es6ToEs5:client:error'),
				error.toString()
			);

			this.emit('end');
			this.end();
		}

		return (
			gulp.src(files.app.src)
				.pipe(resolveNewPath('/'))
				.pipe(plumber())
				.pipe(sourcemaps.init())
				.pipe(cache('Es6ToEs5:client'))
				.pipe(gulpif(isJSX, react({harmony: false, es6module: true}), gutil.noop()).on('error', handleError))
				.pipe(traceur({modules: 'inline', moduleName: true, sourceMaps: true}))
				.pipe(gulpif(isView, sweetjs({
					modules: ['./imajs/macro/react.sjs', './imajs/macro/componentName.sjs'],
					readableNames: true
				}), gutil.noop()))
				.pipe(remember('Es6ToEs5:client'))
				.pipe(plumber.stop())
				.pipe(save('Es6ToEs5:source'))
				.pipe(concat(files.app.name.client))
				.pipe(insert.wrap('(function(){\n', '\n })();\n'))
				.pipe(sourcemaps.write())
				//.pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
				//.pipe(uglify({mangle:true}))
				.pipe(gulp.dest(files.app.dest.client))
				.pipe(save.restore('Es6ToEs5:source'))
				//.pipe(gulpif(isFile, gutil.noop()))
				//.pipe(sourcemaps.init({loadMaps: true}))
				.pipe(concat(files.app.name.server))
				.pipe(insert.wrap('module.exports = function(){\n', '\nreturn $__imajs_47_client_47_main_46_js__; };\n'))
				.pipe(sourcemaps.write())
				.pipe(gulp.dest(files.app.dest.server))
				//.pipe(size())
		);

	});
}