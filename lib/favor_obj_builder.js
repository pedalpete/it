'use strict'
var fs = require("fs");
var favor_obj, config_file;
// default tracking to be true

var gpio_direction = {
    'led': 'out',
    'tri-color-led': 'out',
    'light': 'out'
};
function build_favor_obj(config_file){
    try {
        favor_obj = (function(){
            var Favor_Obj = function(json_obj){
                var self = this;
                //this converts our json object into a javascript object with prototype
                Object.keys(json_obj).forEach(function(key){
                    self[key] = json_obj[key];   
                });
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

            
            // get the favorit.json config file
            var favor_json= new Favor_Obj(JSON.parse(fs.readFileSync(config_file,'utf-8')));
            
            function create_interface(component){
                   if(component.interface==='gpio'){
                        var direction = component.direction || gpio_direction[component.type];
                        if(!direction || !component.address) return console.log('error setting gpio direction: '+component);
                        // if address is array, create an entry for each address
                       if(typeof component.address ==='object'){
                           for(var i=0; i<component.address.length;i++){
                            exportGpio(component.address[i], setDefaultValue(i, component));


                           }
                       } else {
                            exportGpio(component.address);
                       }
                   }
            };


            function setDefaultValue(pin, component){
                fs.writeFile(favor_json.getGpioPath()+pin+'/value', 0, 'utf-8', function(err){
                    if(err) return console.log(err);
                });
            }
            function exportGpio(pin){
               fs.writeFile(favor_json.getGpioPath()+'/export', pin,'utf-8', function(err){
                    if(err) return console.log('+file write error:'+err);
               });

            }

            favor_json.components.forEach( function(component){
                    create_interface(component);   
            });

            // add parsing to the favor_obj
            Favor_Obj.prototype.device_abilities = require('../lib/device_abilities.js');
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
        return favor_obj
    } else {
        return favor_obj.device_abilities(passed_var,favor_obj);
    }
}
module.exports = function(config){
        config_file = config || "./favorit.json";
        build_favor_obj(config_file);
        return favor_core;
    }