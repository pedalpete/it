module.exports = function(modules_array){
    var new_obj = {}
    modules_array.forEach(function(module){
     var module_to_add = require(module);
    for(var key in module_to_add){ 
        new_obj[key] = module_to_add[key];
        }
    });
    return new_obj
}