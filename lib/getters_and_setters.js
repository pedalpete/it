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
    setupGpio(direction,this, x);
    return this;
}

var get = function(){
    var direction = "in";
    if(this.gpio.value) return this.gpio.value;
    setupGpio(direction,this);
    return this.gpio.value;
}



module.exports.get = get;
module.exports.set = set;        
      
