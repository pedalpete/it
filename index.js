
module.exports = function(config, modules) {
	var configFile = config || './favorit';
	return require('./lib/favor_obj_builder.js')(configFile, modules);
};