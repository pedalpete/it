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
                if(direction==='in') return component.gpio.value || 0 ;
		component.gpio.setDirection(direction);
		if(val>0) component.gpio.set(0);
                return component.gpio.set(val);
            }
        });
       
    } else {

        if(component.gpio.direction!==direction){
           component.gpio.setDirection(direction);
           return component.gpio.set(val);
	}   
        if(direction==='in') return component.gpio.value || 0;
        return component.gpio.set(val);
    }
    return component;
}
    

function exportGpio(){
  this.gpio.unexport();   
  
}


var set = function(x, key){
    //key is an optional value used to specify which structure address is being set
    if(isNaN(x)) return this.onError('error: set must be a number, called with '+x, 48,file);
    var direction = "out";
    for(var i = 0; i< this.length; i++){
        if(this[i].structure){
            var keys = getKeysToUpdate(this[i].structure,key);
console.log(keys);
            for(var k=0;k<keys.length;k++){
		console.log(this[i].structure[keys[k]]);
                setupGpio(direction,this[i].structure[keys[k]],x); //address is contained in an object referrenced by the structure of the I/O   
                          
            }
        } else {
            setupGpio(direction,this[i], x);
        }
    }
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



module.exports.get = get;
module.exports.set = set;        
      
