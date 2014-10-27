'use strict'
var fs = require('fs');
var config_file, modules, favor_json, prototype_modules,
    core_modules = ['../lib/device_abilities.js','../lib/getters_and_setters.js','../lib/error_handling.js'],
    add_modules = require('../lib/add_modules.js');

function convert_to_object(json_obj,obj){
                //this converts our json object into a javascript object with prototype
                Object.keys(json_obj).forEach(function(key){
                    obj[key] = json_obj[key];   
                });
    return obj;
}

function add_methods(methods, component){
    // add methods directly on component to override defaults
    methods.forEach(function(method){
        for(var key in method){
            component[key] = require(method[key]);
            }
        });
    return component
};

function setup_components(favor_obj){
    favor_obj.components.forEach(function(component){
         if(component.link){
            //link component to it's linked values from another component
            var linked_component =  favor_obj.components.filter(function(lnk_cmp){
                return lnk_cmp.name === component.link;
            })[0];
            if(linked_component){
                if(linked_component.address){
                    component.address = linked_component.address;
                }
                if(linked_component.structure){
                    var link_struct = component.return_as || component.name;
                    if(linked_component.structure[link_struct].address){
                        //the structure is directly addressed, so link return the direct address
                        component.address = linked_component.structure[link_struct].address;
                    } else {
                        // the structure has a nested structure or is not directly addressed, so return the nested structure
                        component.structure = linked_component.structure[link_struct];   
                    }
                }
                // check if the linked component has methods, and if so 
                if(linked_component.methods){ 
                    add_methods(linked_component.methods,component);
                }
            }
        }
        if(component.methods){
            add_methods(component.methods, component);
        }
       
    });
    global._fvr = favor_obj.components;
    delete favor_obj.components;
    
}
           
function Favor_Obj(){};
Favor_Obj.prototype.init = function(passed_var){
                //search for passed components
                 return this.device_abilities(passed_var);
            }

function build_favor_obj(config_file, modules){

    try {
       

            convert_to_object(config_file,Favor_Obj);
       

         
            
            /* turn on and off 'tracking', which can be used to initiate a function on changes.
            Favor_Obj.prototype.setTracking = function(set){
                if(typeof set !== 'boolean') return $$(.log('setTracking must be either true or false');
                return favor_json.tracking = set;
            }
            */
            Favor_Obj.prototype.getTracking = function(){
                return favor_json.tracking || true;   
            }

            Favor_Obj.prototype.getGpioPath = function(){
                return favor_json['gpio-path'] || '/sys/class/gpio/';   
            }
    
           
        
    } catch(e) {
        Favor_Obj = {"error": "error getting or parsing favor:" +e}
        console.log('error getting or parsing favorit.json:'+e);
     
    } finally {
        return Favor_Obj   
    }
}

function favor_core(passed_var){
    var new_favor = new Favor_Obj;   
    convert_to_object(favor_json,new_favor);
    setup_components(new_favor);
    for(var key in prototype_modules){
      new_favor[key] = prototype_modules[key];   
    }
    
        
    if(passed_var){
      return  new_favor.init(passed_var);
    }
    return new_favor;

}

module.exports = function(config_file, modules){ 
        favor_json = JSON.parse(fs.readFileSync(config_file,'utf-8'));
           if(modules){
             core_modules.push.apply(core_modules,modules);   
            }
        prototype_modules = add_modules(core_modules);
        return favor_core;
    }