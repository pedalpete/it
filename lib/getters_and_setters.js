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

function initializeGpio(component, parent){
 if(!component.direction){
		component.direction = parent.direction || DIRECTION_OBJ[parent.type];
	}
    	component.gpio = gpio.connect(component.address);
        component.gpio.mode(component.direction); //set direction
	component.initialized=true;
	return component;   
}

function initializeI2C(component){
    component.I2C = new i2c(component.address, options);
    if(component.start_sequence) return i2cStartSequence(component)
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
    if(!component.initialized) return initializeI2C(component,i2c_get);
    
    component.I2C.readBytes(component.readAddress, component.readLength, function(err, res){
        if(err) component.onerror(err);
        
    })
    
}

function get(component){ // return gpio value
    var return_value;
    if(component.get) return component.get(component);
    switch(component.interface) {
        case 'gpio' :
            return_value = component.gpio.value();
            break;
        case 'i2c' :
            i2c_get(component, return_get);
            break;
    }
    console.log('return value', return_value);
    return return_value;
}

function set(component,val){ //set gpio value
    if(component.set) return component.set(component,val);
    if(component.gpio){
        val = checkGPIOVal(val);
        return component.gpio.value(val);        
    }
}


function checkGPIOVal(val){
    console.log(typeof val);
    if(typeof val==='boolean') return val;
    if(typeof val==='string') return val.toLowerCase()==='high'? true : false;
    if(typeof val==='number') return val > 0 ? true : false;
    return this.onError('invalid value '+val+' to set GPIO.',46, file);
}


function passComponentsToSetGpio(component, val, key){
/*gets a list of components to set the gpio of, checks that address is a structure
  or a directly addressed component, and then sets the gpio 
*/
  for(var i = 0; i< component.length; i++){
        if(component[i].structure){
            var keys = getKeysToUpdate(component[i].structure,key);
            for(var k=0;k<keys.length;k++){
                var set_component=component[i].structure[keys[k]];
                if(!set_component.initialized){
                     initializeComponent(set_component,component[i]);   
                }
                set(set_component,val); //address is contained in an object referrenced by the structure of the I/O             
            }
        } else {
		if(!component[i].initialized){
			initializeComponent(component[i],component[i]);
		}
            set(component[i], val);
        }
    }
    return component;
}


var _set = function(x, key){
    if(this.parsed_query.class!==null && key){//if key and class exist, merge them to set value
	key+=','+this.parsed_query.class.join(',');
    }
    if(!key && this.parsed_query.class){ //if only class exists, use that to set value
    	var key = this.parsed_query.class.join(',');
    }
    passComponentsToSetGpio(this,x,key);
    return this;
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

function getComponentAsObject(component){
    //the I/O is not directly addressed, but has an object of addresses.
    var output_obj = {};
    for(var key in component.structure){
        if(!component.structure[key].initialized){
            initializeComponent(component.structure[key],component);   
        }
            output_obj[key]=get(component.structure[key]);
    }
    return output_obj;
}

var _get = function(){
    var output_obj ={};
    for(var i=0; i<this.length; i++){
        if(this[i].structure){ //not directly addressed, this is a group of  I/Os   
          output_obj[i] = getComponentAsObject(this[i]);  
        } else {
           	if(!this[i].initialized && this[i].interface === 'gpio'){
			initializeComponent(this[i],this[i]);
		  }
                
            
        output_obj[i]=get(this[i]);
        }
        //check if this[i] has a return_as property
        if(this[i].return_as){
            output_obj[i] = output_obj[i][this[i].return_as];
        }
    }
    return output_obj;
}

function addOnchange(components, dir, fn){
    if(dir===null) dir = 'both';
    if(typeof dir === 'function'){
        var fn = dir;
        dir = 'both';
    }
    if(['both','rise','fall'].indexOf(dir)<0) return this.onError('invalid value for watching changes. Valid watches are both, rise, fall',136, file);
	for(var i=0;i<components.length;i++){
		 if(components[i].structure){
            var keys = getKeysToUpdate(components[i].structure,key);
            for(var k=0;k<keys.length;k++){
                var set_component=components[i].structure[keys[k]];
                if(!set_component.initialized){
                     initializeComponent(set_component,component[i]);   
                }
                set_component.gpio.on(dir,fn);
            }
        } else {
		if(!components[i].initialized){
			initializeComponent(components[i],components[i]);
		}
            components[i].gpio.on(dir,fn);
        }
		
	}
}

function triggerOnChangeFunction(components, function_name){
	for(var i=0;i<components.length;i++){
		if(components[i].value===getGpio(components[i])) return;//no change in value
		components[i][function_name].call();
	}
}


var onChange = function(dir,fn){
	var components = this;
    	addOnchange(components,dir, fn);  
}

module.exports.get = _get;
module.exports.set = _set;        
module.exports.onChange = onChange;
