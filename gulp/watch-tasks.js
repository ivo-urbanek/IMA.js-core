var gulp = require('gulp');
var cache = require('gulp-cached');
var	remember = require('gulp-remember');
var gutil = require('gulp-util');
var runSequence = require('run-sequence');
var flo = require('fb-flo');
var fs = require('fs');

var cssTasks = require("./css-tasks");
var vendorTasks = require("./vendor-tasks");
var serverTasks = require("./server-tasks");

module.exports = function(files, sharedVars) {

	cssTasks(files);
	vendorTasks(files);
	serverTasks(files, sharedVars);
	
	gulp.task('watch', function() {

		gulp.watch(files.app.watch, ['app:build']);
		gulp.watch(files.vendor.watch, ['vendor:build']);
		gulp.watch(files.less.watch, ['less']);
		gulp.watch(files.server.watch, ['server:build']);
		gulp.watch(files.locale.watch, ['locale:build']);

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

	// BUILD tasks for watch

	gulp.task('app:build', function(callback) {
		return runSequence(
			'Es6ToEs5:client',
			'server:restart',
			'server:reload',
			callback
		);
	});
}



	

