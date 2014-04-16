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
                if(direction==='in') return component.gpio.value;
                component.gpio.set(val);
            }
        });
       
    } else {

        if(component.gpio.direction!==direction){
           component.gpio.setDirection(direction);
        }   
        if(direction==='in') return component.gpio.value;
        console.log('set val-'+val);
        component.gpio.set(val);
    }
    return component;
}
    

function exportGpio(){
  this.gpio.unexport();   
  
}


var set = function(x){
    if(isNaN(x)) return this.onError('error: set must be a number, called with '+x, 48,file);
    var direction = "out";
    for(var i = 0; i< this.length; i++){
        setupGpio(direction,this[i], x);
    }
    return this;
}

var get = function(){
    var direction = "in";
    var output_obj ={};
    for(var i=0; i<this.length; i++){
        if(this[i].gpio && this[i].gpio.value) return this[i].gpio.value;
        setupGpio(direction,this[i]);
        output_obj[i]=this[i];
    }
    return output_obj;
}



module.exports.get = get;
module.exports.set = set;        
      
