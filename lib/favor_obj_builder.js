'use strict'
var fs = require("fs-extra"),
    favor_obj, config_file, modules,
    core_modules = ['../lib/getters_and_setters.js','../lib/error_handling.js'],
    add_modules = require('../lib/add_modules.js');

// default tracking to be true

var gpio_direction = {
    'led': 'out',
    'tri-color-led': 'out',
    'light': 'out'
};
function build_favor_obj(config_file, modules){
   
    try {
        favor_obj = (function(){
            var Favor_Obj = function(json_obj, modules){  
                 var self = this;
                 convert_to_object(json_obj,self);
                
                // convert each component into an object
                json_obj.components.forEach(function(obj,idx){
                    self.components[idx] = new Component_Obj(obj);
                });
                return global.favor = self
            }

            var Component_Obj = function(component){
                var self = this;
                convert_to_object(component,self);
                return self;
            }
            
            
            // turn on and off 'tracking', which can be used to initiate a function on changes.
            Favor_Obj.prototype.setTracking = function(set){
                if(typeof set !== 'boolean') return console.log('setTracking must be either true or false');
                return favor_json.tracking = set;
            }

            Favor_Obj.prototype.getTracking = function(){
                return favor_json.tracking || true;   
            }

            Favor_Obj.prototype.getGpioPath = function(){
                return favor_json['gpio-path'] || '/sys/class/gpio/';   
            }

            Favor_Obj.prototype.init = function(passed_var){
                if(passed_var){
                    //build the object
                    var psed = favor_obj.device_abilities(passed_var);
                    return psed;
                }
                return favor_obj;
            }
           
            // convert a json object to a javascript object
            function convert_to_object(json_obj,obj){
                //this converts our json object into a javascript object with prototype
                Object.keys(json_obj).forEach(function(key){
                    obj[key] = json_obj[key];   
                });
            }
            // get the favorit.json config file
            var favor_json= new Favor_Obj(config_file, modules);
            
            function create_interface(component){
                   if(component.interface==='gpio'){
                   
                        // if address is array, create an entry for each address
                       if(typeof component.address ==='object'){
                           for(var i=0; i<component.address.length;i++){
                            exportGpio(component.address[i],component);
                           }
                       } else {
                            exportGpio(component.address,component);
                       }
                   }
            };

            function setupFile(path, value){
                try {
                  fs.writeFileSync(path, value);   
                } catch(e){
                    new Error('Error updating file:'+e, 87, 'favor_obj_builder.js');
                    try {
                        fs.outputFileSync(path, value);
                    } catch(e){
                        new Error('Error trying to create file:'+e,91,'favor_obj_builder.js');   
                    }
                }
            }

            function setGpioDefaultValue(pin, component){
                var value = component.default_value || 0;
                setupFile(favor_json.getGpioPath()+pin+'/value', value);                    
            }
            function setGpioDirection(pin, component){
                    var direction = component.direction || gpio_direction[component.type];
                    if(!direction || !component.address) return console.log('error setting gpio direction: '+component);
               setupFile(favor_json.getGpioPath()+pin+'/direction', direction);
            }
            function exportGpio(pin,component){
                //export the pin and prep the gpio
                setupFile(favor_json.getGpioPath()+'/export', pin);
                setGpioDirection(pin, component);
                setGpioDefaultValue(pin, component);
            }

            

            // add parsing to the favor_obj
            require('../lib/device_abilities.js')(Favor_Obj);
            
            // build the modules and extend Favor_obj to include the modules
            if(modules){
             core_modules.push.apply(core_modules,modules);   
            }
            
            core_modules.forEach(function(module){
                 add_modules(Favor_Obj,Component_Obj,module);
            });
            
            favor_json.components.forEach( function(component){
                    create_interface(component);   // bind to the interface
            });
           
            return favor_json;
        })();
    } catch(e) {
        favor_obj = {"error": "error getting or parsing favor:" +e}
        console.log('error getting or parsing favorit.json:'+e);
     
    } finally {
        return favor_obj;   
    }
}

function favor_core(passed_var){
    if(!passed_var){
        return favor_obj;   
        
    } else {        
        return favor_obj.init(passed_var);   
    }
}

module.exports = function(config_file, modules){ 
        build_favor_obj(JSON.parse(fs.readFileSync(config_file,'utf-8')), modules);
        return favor_core;
    }