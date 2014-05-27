'use strict'
var fs = require('fs');
var config_file, modules, favor_json, prototype_modules,
    core_modules = ['../lib/device_abilities.js','../lib/getters_and_setters.js','../lib/error_handling.js'],
    add_modules = require('../lib/add_modules.js');

// default tracking to be true

var gpio_direction = {
    'led': 'out',
    'tri-color-led': 'out',
    'light': 'out'
};

function convert_to_object(json_obj,obj){
                //this converts our json object into a javascript object with prototype
                Object.keys(json_obj).forEach(function(key){
                    obj[key] = json_obj[key];   
                });
    return obj;
}

function add_component_methods(favor_obj){
    favor_obj.components.forEach(function(component){
        if(!component.methods)return;
        component.methods.forEach(function(method){
            for(var key in method){
                component[key] = require(method[key]);
            }
        });
    });
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
    add_component_methods(new_favor);
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