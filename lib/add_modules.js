module.exports = function(json_obj,component_obj,moduleName){
     var module_to_add = require(moduleName);
    for(var key in module_to_add){ 
        json_obj.prototype[key] = function(json_obj){
            json_obj.prototype = module_to_add[key];
            return json_obj
        }
        component_obj.prototype[key] = module_to_add[key];
     }    
}