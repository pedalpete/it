module.exports = function(json_obj,component_obj,moduleName){
     var module_to_add = require(moduleName);
    for(var key in module_to_add){ 
        json_obj.prototype[key] = module_to_add[key];
        component_obj.prototype[key] = module_to_add[key];
     }    
}