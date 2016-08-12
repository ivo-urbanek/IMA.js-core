
let gulp = require('gulp');
let babel = require('gulp-babel');
let plumber = require('gulp-plumber');
let sourcemaps = require('gulp-sourcemaps');
let tap = require('gulp-tap');

gulp.task('ima:compile', () => {
	return (
		gulp
			.src([
				__dirname + '/main.js',
				__dirname + '/namespace.js',
				__dirname + '/ObjectContainer.js',
				__dirname + '/!(node_modules)/**/!(*Spec).js'
			])
			.pipe(plumber())
			.pipe(sourcemaps.init())
			.pipe(babel({
				moduleIds: true,
				presets: ['es2015'],
				plugins: ['external-helpers-2']
			}))
			.pipe(plumber.stop())
			.pipe(tap((file) => {
				let moduleName = 'ima' + file.path.slice(__dirname.length, -3);
				let fileContents = file.contents.toString();

				let dependencyMatcher = /require\(['"]([^'"]+)['"]\)/g;
				let dependencies = [];
				let match = dependencyMatcher.exec(fileContents);
				while (match) {
					dependencies.push(match[1]);
					match = dependencyMatcher.exec(fileContents);
				}

				let exportMatcher = /\nexports\.([a-zA-Z_][a-zA-Z_1-9]*)\s*=\s*([^;]+);/g;
				let moduleExports = [];
				match = exportMatcher.exec(fileContents);
				while (match) {
					moduleExports.push({ symbol: match[1], value: match[2] });
					match = exportMatcher.exec(fileContents);
				}

				file.contents = new Buffer(
					fileContents + '\n\n' +
					`$IMA.Loader.register('${moduleName}', [${dependencies.map(dependency => `'${dependency}'`).join(', ')}], function (_export, _context) {\n` +
					`	'use strict';\n` +
					`	return {\n` +
					`		setters: [${dependencies.map(() => 'function () {}').join(', ')}],\n` +
					`		execute: function () {\n` +
					moduleExports.map(({ symbol, value }) => `			_export('${symbol}', exports.${symbol});\n`).join('') +
					`		}\n` +
					`	};\n` +
					`});\n`
				);
			}))
			.pipe(sourcemaps.write())
			.pipe(gulp.dest('.'))
	);
});
