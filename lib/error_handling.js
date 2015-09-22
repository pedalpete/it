module.exports.onError = function(err, line, script) {
	console.log('The following error curred :' +
	err + ' on line ' + line + ' in script ' + script);
};