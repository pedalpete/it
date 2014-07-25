'use strict'

/* the below code is so we can test the getters and setters effectively. 
The native-gpio methods are mocked out in the mock file, than we export the  methods (mocked in x86) to test they were called properly. 
*/
var gpio =  require('os').arch() === 'arm' ? require('pi-pins'): require('../tests/mock_pi-pins.js');

var file = 'getters_and_setters.js';
// setup with pin numbers, does not use special raspberry pi pin mapping

var DIRECTION_OBJ = {
    'led':'OUT',
    'button':'IN',
    'sensor':'IN',
    'temperature': 'IN'
}

function initializeComponent(component,parent){
	if(!component.direction){
		component.direction = parent.direction || DIRECTION_OBJ[parent.type];
	}
    	component.gpio = gpio.connect(component.address);
        component.gpio.mode(gpio[component.direction]); //set direction
	component.initialized=true;
	return component;
}
   
function get(component){ // return gpio value
    if(component.get) return component.get(component);
    if(component.interface==='gpio')return component.gpio.value();
}
function set(component,val){ //set gpio value
    if(component.set) return component.set(val);
    if(component.interface==='gpio'){
        val = checkGPIOVal(val);
        return component.gpio.value(val);        
    }
}


function checkGPIOVal(val){
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
           	if(!this[i].initialized){
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

function addOnChangeFunctionToComponent(components,fn){
	for(var i=0;i<components.length;i++){
		if(!components[i].initialized){
			initializeComponent(components[i],components[i]);
		}
		components[i][fn.name]=fn;
		components[i].value = getGpio(components[i]);
	}
}

function triggerOnChangeFunction(components, function_name){
	for(var i=0;i<components.length;i++){
		if(components[i].value===getGpio(components[i])) return;//no change in value
		components[i][function_name].call();
	}
}


var onChange = function(fn,timeout){
	var components = this;
	var timeout = timeout || 100;
    	addOnChangeFunctionToComponent(components,fn);
	setInterval(function(){
		triggerOnChangeFunction(components,fn.name);
	},timeout);    
}
module.exports.get = _get;
module.exports.set = _set;        
module.exports.onChange = onChange;
