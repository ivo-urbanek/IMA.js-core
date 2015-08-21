var gulp = require('gulp');
var cache = require('gulp-cached');
var	remember = require('gulp-remember');
var gutil = require('gulp-util');
var flo = require('fb-flo');
var fs = require('fs');

var buildTasks = require("./build-tasks");
var vendorTasks = require("./vendor-tasks");
var serverTasks = require("./server-tasks");

module.exports = function(files, sharedVars) {

	buildTasks(files);
	serverTasks(files, sharedVars);
	
	gulp.task('watch', function() {

		gulp.watch(files.app.watch, ['build:app']);
		gulp.watch(files.vendor.watch, ['build:vendor']);
		gulp.watch(files.less.watch, ['build:less']);
		gulp.watch(files.server.watch, ['build:server']);
		gulp.watch(files.locale.watch, ['build:locale']);

		gulp.watch(['./imajs/**/*.{js,jsx}', './app/**/*.{js,jsx}', './build/static/js/locale/*.js']).on('change', function(e) {
			sharedVars.watchEvent = e;
			if (e.type === 'deleted') {

				if (cache.caches['Es6ToEs5:client'][e.path]) {
					delete cache.caches['Es6ToEs5:client'][e.path];
					remember.forget('Es6ToEs5:client', e.path);
				}

			}
		});

		flo('./build/static/', {
				port: 5888,
				host: 'localhost',
				glob: [
					'**/*.css'
				]
			},
			function(filepath, callback) {
				gutil.log('Reloading \' public/' + gutil.colors.cyan(filepath) + '\' with flo...');
				callback({
					resourceURL: 'static/' + filepath,
					contents: fs.readFileSync('./build/static/' + filepath).toString()
					//reload: filepath.match(/\.(js|html)$/)
				});
			});
	});
}



	

