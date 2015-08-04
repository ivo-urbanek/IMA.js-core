module.exports = function(files) {
	var sharedVars = require("./gulp/shared-variables");
	require("./gulp/doc-tasks")(files);
	require("./gulp/css-tasks")(files);
	require("./gulp/vendor-tasks")(files);
	require("./gulp/locale-tasks")(files);
	require("./gulp/copy-tasks")(files);
	require("./gulp/polyfill-tasks")(files);
	require("./gulp/build-tasks")(files);
	require("./gulp/test-tasks")(files);
	require("./gulp/client-tasks")(files);
	require("./gulp/server-tasks")(files, sharedVars);
	require("./gulp/watch-tasks")(files, sharedVars);
	require("./gulp/examples-tasks")();
}