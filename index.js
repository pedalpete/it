
module.exports = function(config, modules){
        config_file = config || "./favorit";
        return require('./lib/favor_obj_builder.js')(config_file, modules);
}