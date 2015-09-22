module.exports = function(modulesArray) {
	var newObj = {};
	modulesArray.forEach(function(module) {
	var moduleToAdd = require(module);
	for (var key in moduleToAdd) {
		newObj[key] = moduleToAdd[key];
		}
	});
	return newObj;
};