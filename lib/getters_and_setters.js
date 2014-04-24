'use strict'
var gpio = require('gpio');

var file = 'getters_and_setters.js';

var direction_obj = {
    'led':'out',
    'button':'in',
    'sensor':'in'
}

function setupGpio(component, val){
    if(!component.direction) {
        // no direction, return an error
        component['error']=['direction is not defined',17,file];
        return component;
    }
    if(!component.gpio){
        component.gpio = gpio.export(component.address, {
          direction: component.direction,
            ready: function(){
                if(direction==='in') return this.value;
		        return this.set(val);
            }
        });
       
    } else {
        setGpio(component,val);
    }
    return component;
}
   

function setGpio(component,val){
        if (!val) return component.gpio.value;
        if(typeof val === 'function'){
                    component.gpio.on('change', val);   
                } else {
                    if(component.gpio.direction==='in') return this.onError('cannot set a value where component direction is in', 36, file);
                    component.gpio.set(val);
                }   
}

function exportGpio(){
  this.gpio.unexport();   
  
}

function setupComponentStructure(component,parentDetails){
    if(!component.type){
        component.type=parentDetails.type;   
    }
    if(!component.direction){
        component.direction = parentDetails.direction || direction_obj[component.type];   
    }
    return component;
}
function passAddressToSetGpio(component, val, key){
  for(var i = 0; i< component.length; i++){
        if(component[i].structure){
            var keys = getKeysToUpdate(component[i].structure,key);
            for(var k=0;k<keys.length;k++){
                var set_component=component[i].structure[keys[k]];
                if(!set_component.type){
                    
                   //setup the type and directoin for this component
                     setupComponentStructure(set_component,component[i]);   
                }
                setupGpio(set_component,val); //address is contained in an object referrenced by the structure of the I/O             
            }
        } else {
            if(!component[i].direction){
                component[i].direction = direction_obj[component[i].type];
            }
            setupGpio(component[i], val);
        }
    }
    return component;
}
var set = function(x, key){
    //key is an optional value used to specify which structure address is being set
    if(isNaN(x)) return this.onError('error: set must be a number, called with '+x, 48,file);
    passAddressToSetGpio(this,x,key);
    return this;
}

function getKeysToUpdate(structure,keys){
    if(!keys) return Object.keys(structure);
    return keys.split(',').filter(function(key){
       return Object.keys(structure).indexOf(key)>=0;
    });
    
    
}

function getAddressAsObject(component){
    //the I/O is not directly addressed, but has an object of addresses.
    var output_obj = {};
    for(var key in component.structure){
        if(!component.structure[key].type){
            setupComponentStructure(component.structure[key],component);   
        }
        if(!component.structure[key].gpio || !component.structure[key].gpio.value){
         output_obj[key]=setupGpio(component.structure[key]);   
        } else {
            output_obj[key]=component.structure[key].gpio.value;
        }
    }
    return output_obj;
}

var get = function(){
    var output_obj ={};
    for(var i=0; i<this.length; i++){
        if(this[i].structure){ //not directly addressed, this is a group of  I/Os   
          output_obj[i] = getAddressAsObject(this[i]);  
            if(output_obj[i].error){
                this.onError.apply(output_obj[i].error)   
            }
        } else {
            if(!this[i].gpio || !this[i].gpio.value){
                if(!this[i].direction){
                    this[i].direction = direction_obj[this[i].type];
                }
                setupGpio(this[i]);
            }
        output_obj[i]=this[i];
            if(output_obj[i].error){
                this.onError.apply(output_obj[i].error)   
            }
        }
    }
    return output_obj;
}


var onChange = function(fn,key){
    passAddressToSetGpio(this,fn,key);
    return this;
}
module.exports.get = get;
module.exports.set = set;        
module.exports.onChange = onChange;
