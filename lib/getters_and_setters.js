'use strict'
var wpi = require('wiring-pi');

var file = 'getters_and_setters.js';
// setup with pin numbers, does not use special raspberry pi pin mapping
wpi.setup('gpio');

var direction_obj = {
    'led':'OUTPUT',
    'button':'INPUT',
    'sensor':'INPUT'
}

function initializeComponent(component,parent){
	if(!component.direction){
		component.direction = parent.direction || direction_obj[parent.type];
	}
    	wpi.pinMode(component.address,wpi.modes[component.direction]);
	component.initialized=true;
	return component;
}
   
function getGpio(component){ // return gpio value
	return wpi.digitalRead(component.address);
}
function setGpio(component,val){ //set gpio value
	return wpi.digitalWrite(component.address, val);        
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
                setGpio(set_component,val); //address is contained in an object referrenced by the structure of the I/O             
            }
        } else {
		if(!component[i].initialized){
			initializeComponent(component[i],component[i]);
		}
            setGpio(component[i], val);
        }
    }
    return component;
}


var set = function(x, key){
    //key is an optional value used to specify which structure address is being set
    if(isNaN(x)) return this.onError('error: set must be a number, called with '+x, 48,file);
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
       
            output_obj[key]=getGpio(component.structure[key]);
    }
    return output_obj;
}

var get = function(){
    var output_obj ={};
    for(var i=0; i<this.length; i++){
        if(this[i].structure){ //not directly addressed, this is a group of  I/Os   
          output_obj[i] = getComponentAsObject(this[i]);  
            if(output_obj[i].error){
                this.onError.apply(output_obj[i].error)   
            }
        } else {
           	if(!this[i].initialized){
			initializeComponent(this[i],this[i]);
		}
                
            
        output_obj[i]=getGpio(this[i]);
            if(output_obj[i].error){
                this.onError.apply(output_obj[i].error)   
            }
        }
    }
    return output_obj;
}

function addOnChangeFunctionToComponent(components,fn){
	for(var i=0;i<components.length;i++){
		if(!components[i].initialized){
			console.log(components[i]);
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
	console.log(components);
	var timeout = timeout || 2000;
    	addOnChangeFunctionToComponent(components,fn);
	setInterval(function(){
		triggerOnChangeFunction(components,fn.name);
	},timeout);    
}
module.exports.get = get;
module.exports.set = set;        
module.exports.onChange = onChange;
