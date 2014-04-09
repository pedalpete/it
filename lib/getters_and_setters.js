'use strict'
var q = require('Q');
var gpio = require('gpio');

var file = 'getters_and_setters.js';
var get = function(){
    var direction = "in";
    var val;
    setupGpio(direction,this).then(function(component){
        return component.gpio.value;
    });
    
}

function watchTimer(){
    
}

function setupGpio(direction, component){
    var deferred = q.defer();
    if(!component.gpio){
        component.gpio = gpio.export(component.address, {
          direction: direction,
            ready: function(){
                deferred.resolve(component);
            }
        });
       
    } else {
     component.gpio.setDirection(direction);   
     deferred.resolve(component);
    }
    return deferred.promise;
}
    

function exportGpio(){
  this.gpio.unexport();   
  
}


var set = function(x){
    if(isNaN(x)) return this.onError('error: set must be a number, called with '+x, 48,file);
    var direction = "out";
    setupGpio(direction,this).then(function(component){
        component.gpio.set(x);
    });
    return this;
}




module.exports.get = get;
module.exports.set = set;        
      
