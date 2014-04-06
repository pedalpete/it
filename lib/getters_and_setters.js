'use strict'
var fs = require('fs');
var file = 'getters_and_setters.js';
var get = function(){
    return parseInt(fs.readFileSync(global.favor.getGpioPath()+this.address+'/value', 'utf-8')); 
}

var set = function(x){
    if(x==='new') return this.onError(x+' is not a valid value',8,file);
    if(typeof x ==='string') {
        x=convertValue(x);   
    }
    return fs.writeFileSync(global.favor.getGpioPath()+this.address+'/value',x)
}

function convertValue(x){
     return  x.toLowerCase()==='low' ? 0 : 1;
}

module.exports.get = get;
module.exports.set = set;        
      
