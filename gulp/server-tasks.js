var gulp = require('gulp');
var gls = require('gulp-live-server');
var runSequence = require('run-sequence');
var shell = require('gulp-shell');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');

var uglifyCompression = {
	global_defs: {
		$Debug: true
	},
	dead_code: true
};

module.exports = function(files, sharedVars) {
	var server = null;

	gulp.task('Es6ToEs5:server', shell.task('traceur --dir ' + files.server.src + ' ' + files.server.dest + '  --modules=commonjs --source-maps=inline'));

	gulp.task('bundle:js:server', function() {
		var file = files.app.dest.server + files.app.name.server;

		return (
			gulp.src(file)
				.pipe(plumber())
				.pipe(uglify({mangle:false, output: {beautify: true}, compress: uglifyCompression}))
				.pipe(plumber.stop())
				.pipe(gulp.dest(files.app.dest.server))
		);
	});

	gulp.task('server', function() {
		server =  gls.new('./build/server.js');
		server.start();
	});

	gulp.task('server:reload', function(callback) {
		setTimeout(function() {
			server.notify(sharedVars.watchEvent);
			callback();
		}, 2000);
	});

	gulp.task('server:restart', function() {
		server.start();
	});	
}