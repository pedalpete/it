'use strict'
var file = 'getters_and_setters.js';
var get = function(){
   return this.value || 0;
}

var set = function(x){
    if(x==='new') return this.onError(x+' is not a valid value',8,file);
    if(typeof x ==='string') {
        x=convertValue(x);   
    }
    this.value =x;   
}

function convertValue(x){
     return  x.toLowerCase()==='low' ? 0 : 1;
}

module.exports.get = get;
module.exports.set = set;        
      
