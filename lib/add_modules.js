module.exports = function(modulesArray) {
	var newObj = {};
	modulesArray.forEach(function(moduleName) {
		var moduleToAdd = require(moduleName);
		for (var key in moduleToAdd) {
			newObj[key] = moduleToAdd[key];
		}
	});
	return newObj;
};