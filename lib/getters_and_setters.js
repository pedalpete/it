'use strict'

/* the below code is so we can test the getters and setters effectively. 
The native-gpio methods are mocked out in the mock file, than we export the  methods (mocked in x86) to test they were called properly. 
*/
var gpio =  require('os').arch() === 'arm' ? require('pi-pins'): require('../tests/mock_pi-pins.js');
var i2c = require('os').arch() === 'arm' ? require('i2c') : require('../tests/mock_i2c.js');

var file = 'getters_and_setters.js';
// setup with pin numbers, does not use special raspberry pi pin mapping

var DIRECTION_OBJ = {
    'led':'out',
    'button':'in',
    'sensor':'in',
    'temperature': 'in'
}

function initializeGpio(fvr,idx,parent,val,next,cb){
    var component=fvr[idx];
 if(!component.direction){
		component.direction = parent.direction || DIRECTION_OBJ[parent.type];
	}
    	component.gpio = gpio.connect(component.address);
        component.gpio.mode(component.direction); //set direction
	component.initialized=true;
    if(next==='get') get(fvr,idx,cb);
    if(next==='set') set(fvr,idx,val,cb);
    if(next==='change') component.gpio.on(val,cb);//set the on change event to respond as the callback
}

function initializeI2C(component){
    component.I2C = new i2c(component.address, options);
    component.initialized = true;
}

function initializeComponent(component,parent){
    var cp;
	switch(component.interface) {
        case 'gpio':
            cp = initializeGpio(component,parent);
            break;
        case 'i2c': 
            cp = initializeI2C(component);
    }
    if(component.initialized) return cp;
    // add an onerror notification if initialized failed 
}

function i2c_get(component){
    
    
}

function _ready(fvr,typ,cb){
    fvr._return_length++;
    if(typ==='get' && fvr._return_length===fvr.length){
        delete fvr._return_length;
        cb(fvr._output);
    }
    if(typ==='set' && fvr._return_length===fvr.length){
        delete fvr._return_length;
        if(cb) cb(fvr);
        return;
    }
}

function get(fvr,idx,cb){ // return gpio value
    var component=fvr[idx];
    if(component.get) return component.get(fvr,component,function(val){
        if(component.link) {
            fvr._output[idx]=val[component.return_as];   
        } else {
            fvr._output[idx]=val;      
        }
        _ready(fvr,'get',cb); 
    });
    switch(component.interface) {
        case 'gpio' :
            fvr._output[idx]=component.gpio.value();
            _ready(fvr,'get',cb);
            break;
        case 'i2c' :
            i2c_get(component);
            break;
    }
}

function set(fvr,idx,val,cb){ //set gpio value
    var component=fvr[idx];
    if(component.set) return component.set(fvr[idx],val,function(){
        _ready(fvr,'set',cb);   
    });
    switch(component.interface) {
    case 'gpio' :
        val = checkGPIOVal(fvr,val);
        component.gpio.value(val);        
        _ready(fvr,'set',cb);
        break;
    }
}


function checkGPIOVal(fvr,val){
    if(typeof val==='boolean') return val;
    if(typeof val==='string') return val.toLowerCase()==='high'? true : false;
    if(typeof val==='number') return val > 0 ? true : false;
    return fvr.onError('invalid value '+val+' to set GPIO.',46, file);
}


function passComponentsToSetGpio(fvr, val, key, cb){
/*gets a list of components to set the gpio of, checks that address is a structure
  or a directly addressed component, and then sets the gpio 
*/
  for(var i = 0; i< fvr.length; i++){
      var component = fvr[i];
        if(component.structure){
            var keys = getKeysToUpdate(component.structure,key);
            for(var k=0;k<keys.length;k++){
                var set_component=component.structure[keys[k]];
                if(!set_component.initialized){
                     initializeComponent(fvr,[i,k],component,val,'set',cb);   
                } else {
                    set(fvr,[i,k],val,cb); //address is contained in an object referrenced by the structure of the I/O             
                }
            }
        } else {
		      if(!component.initialized && component.interface==='gpio'){
			     initializeGpio(fvr,i,component,val,'set',cb);
		      } else {
                set(fvr,i,val,cb)
            }
        }
    }
}


var _set = function(x, key,cb){
    this._return_length = 0;
    if(!cb && typeof key==='function'){
        //a callback was provided as the key so delete key and set as callback
        cb=key;
        key=false;
    }
    if(this.parsed_query.class!==null && key && typeof key !== 'function'){
        //if key and class exist, merge them to set value
	   key+=','+this.parsed_query.class.join(',');
    }
    if(!key && this.parsed_query.class){ 
        //if only class exists, use that to set value
    	var key = this.parsed_query.class.join(',');
    }
    passComponentsToSetGpio(this,x,key,cb);
}

function getKeysToUpdate(structure,keys){
/* when a component has multiple addresses, we may not want to update all of them
this allows us to get an array of the object keys to update
*/
    if(!keys) return Object.keys(structure);
    return keys.split(',').filter(function(key){
       return Object.keys(structure).indexOf(key)>=0;
    });
    
    
}

function getComponentAsObject(fvr,i,cb){
    //the I/O is not directly addressed, but has an object of addresses.
    var component = fvr[i];
    for(var key in component.structure){
        if(!component.structure[key].initialized){
            initializeGpio(fvr,i,component,null,'get',cb);   
        }
            get(fvr,i,cb)
    }
}

var _get = function(cb){
    this._output = {};
    this._return_length = 0;
    for(var i=0; i<this.length; i++){
        if(this[i].structure){ //not directly addressed, this is a group of  I/Os   
          getComponentAsObject(this,i,cb);  
        } else {
           	if(!this[i].initialized && this[i].interface === 'gpio'){
			initializeGpio(this,i,this[i],null,'get',cb);
            }
            get(this,i,cb);
        }
    }
}

function addOnchange(fvr, dir, fn){
    if(dir===null) dir = 'both';
    if(typeof dir === 'function'){
        var fn = dir;
        dir = 'both';
    }
    if(['both','rise','fall'].indexOf(dir)<0) return this.onError('invalid value for watching changes. Valid watches are both, rise, fall',200, file);
	for(var i=0;i<fvr.length;i++){
		 if(fvr[i].structure){
            var keys = Object.keys(components[i].structure);
            for(var k=0;k<keys.length;k++){
                var set_component=components[i].structure[keys[k]];
                if(!set_component.initialized){
                     initializeGpio(fvr,i,fvr[i],dir,'change',fn);   
                }else {
                    set_component.gpio.on(dir,fn);
                }
            }
        } else {
		if(!fvr[i].initialized){
			initializeGpio(fvr,i,fvr[i],dir,'change',fn);
		}
            fvr[i].gpio.on(dir,fn);
        }
		
	}
}




var onChange = function(dir,fn){ 
    	addOnchange(this,dir, fn);  
}

module.exports.get = _get;
module.exports.set = _set;        
module.exports.onChange = onChange;
