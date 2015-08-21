module.exports = function(files) {
	var sharedVars = require("./gulp/shared-variables");
	require("./gulp/build-tasks")(files);
	require("./gulp/bundle-tasks")(files);
	require("./gulp/client-tasks")(files);
	require("./gulp/copy-tasks")(files);
	require("./gulp/doc-tasks")(files);
	require("./gulp/examples-tasks")();
	require("./gulp/locale-tasks")(files);
	require("./gulp/polyfill-tasks")(files);
	require("./gulp/server-tasks")(files, sharedVars);
	require("./gulp/test-tasks")(files);
	require("./gulp/vendor-tasks")(files);
	require("./gulp/watch-tasks")(files, sharedVars);
}