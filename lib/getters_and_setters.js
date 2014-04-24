'use strict'
var gpio = require('gpio');

var file = 'getters_and_setters.js';


function watchTimer(){
    
}

function setupGpio(direction, component, val){
    if(!component.gpio){
        component.gpio = gpio.export(component.address, {
          direction: direction,
            ready: function(){
              setGpio(direction,component,val);
            }
        });
       
    } else {
        setGpio(direction,component,val);
    }
    return component;
}
    
function setGpio(direction,component,val){
   if(direction==='in' && typeof val !=='function') return component.gpio.value;
                if(typeof val === 'function'){
                    component.gpio.on('change', val);   
                } else {
			console.log('set val: '+val)
                    component.gpio.set(val);
                }   
}

function exportGpio(){
  this.gpio.unexport();   
  
}

function passAddressToSetGpio(direction, component, val, key){
  for(var i = 0; i< component.length; i++){
        if(component[i].structure){
            var keys = getKeysToUpdate(component[i].structure,key);
            for(var k=0;k<keys.length;k++){
                setupGpio(direction,component[i].structure[keys[k]],val); //address is contained in an object referrenced by the structure of the I/O             
            }
        } else {
            setupGpio(direction,component[i], val);
        }
    }
    return component;
}
var set = function(x, key){
    //key is an optional value used to specify which structure address is being set
    if(isNaN(x)) return this.onError('error: set must be a number, called with '+x, 48,file);
    var direction = "out";
    passAddressToSetGpio(direction,this,x,key);
    return this;
}

function getKeysToUpdate(structure,keys){
    if(!keys) return Object.keys(structure);
    return keys.split(',').filter(function(key){
       return Object.keys(structure).indexOf(key)>=0;
    });
    
    
}

function getAddressAsObject(direction,component){
    //the I/O is not directly addressed, but has an object of addresses.
    var output_obj = {};
    for(var key in component.structure){
        if(!component.structure[key].gpio || !component.structure[key].gpio.value){
         output_obj[key]=setupGpio(direction,component.structure[key]);   
        } else {
            output_obj[key]=component.structure[key].gpio.value;
        }
    }
    return output_obj;
}

var get = function(){
    var direction = "in";
    var output_obj ={};
    for(var i=0; i<this.length; i++){
        if(this[i].structure){ //not directly addressed, this is a group of  I/Os
          output_obj[i] = getAddressAsObject(direction,this[i]);   
        } else {
            if(!this[i].gpio || !this[i].gpio.value){
                setupGpio(direction,this[i]);
            }
        output_obj[i]=this[i];
        }
    }
    return output_obj;
}


var onChange = function(fn,key){
    var direction = "in";
    passAddressToSetGpio(direction,this,fn,key);
    return this;
}
module.exports.get = get;
module.exports.set = set;        
module.exports.onChange = onChange;
