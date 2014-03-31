'use strict'
var fs = require("fs");
var config_file ="./favorit.json";
var favor_obj;
// default tracking to be true

var gpio_direction = {
    'led': 'out',
    'tri-color-led': 'out',
    'light': 'out'
};
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

            fs.writeFileSync('tests/create_file','test','utf-8');
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
       
    
        return favor_json;
    })();
} catch(e) {
    console.log('error getting or parsing favorit.json:'+e);
    return;
}

module.exports = favor_obj