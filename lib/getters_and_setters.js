'use strict'

/* the below code is so we can test the getters and setters effectively. 
The native-gpio methods are mocked out in the mock file, than we export the  methods (mocked in x86) to test they were called properly. 
*/
var gpio =  require('os').arch() === 'arm' ? require('pi-pins'): require('../tests/mock_pi-pins.js');
var i2c = require('os').arch() === 'arm' ? require('i2c') : require('../tests/mock_i2c.js');
var mathjs = require('mathjs');

var file = 'getters_and_setters.js';
// setup with pin numbers, does not use special raspberry pi pin mapping

var DIRECTION_OBJ = {
    'led':'out',
    'button':'in',
    'sensor':'in',
    'temperature': 'in'
}

var I2CCMDs = {
        'write': I2CWrite,
        'read': I2CRead
    }

function initializeComponent(val,next,cb){
    switch(_fvr[this._index].interface || _fvr[this._parent].interface) {
        case 'i2c':
            this._method='init';
            initializeI2C.call(this,val,next,cb);
            break;
        case 'gpio':
            if(!_fvr[this._index].direction){
                _fvr[this._index].direction = _fvr[this._parent].direction || DIRECTION_OBJ[_fvr[this._parent].type];
            }
                _fvr[this._index].gpio = gpio.connect(_fvr[this._index].address);
                _fvr[this._index].gpio.mode(_fvr[this._index].direction); 
            _fvr[this._index].initialized=true;
            if(next==='get') get.call(this,cb);
            if(next==='set') set.call(this,val,cb);
            if(next==='change') _fvr[this._index].gpio.on(val,cb);//set the on change event to respond as the callback
            break;
    }
}


function checkArray(index){
    return Array.isArray(_fvr[this._index][this._method]) && _fvr[this._index][this._method].length<idx+1;
}

function waterfall(cmd, idx, val, next, cb){
    if(checkArray.call(this,idx)) cmd.call(this, idx, val, next, cb)
}

function initializeI2C(val, next, cb){
    _fvr[this._index].i2c = new i2c(_fvr[this._index].address, _fvr[this._index].i2c_device_address || this.i2c.device_address);
    if(checkArray.call(this,0)) return waterfall.call(this, I2CWrite, 0, val, next, cb);
    return I2CWrite.call(this, null, null, val, next, cb);
}

function I2CWrite(idx, val, next, cb){
    var frv = this;
    var cmp = idx ? _fvr[this._index][this._method][idx] : _fvr[this._index][this._method];
    
    function afterWrite(){
      if(this.err) this.onError('error writing i2c', err);
        idx++;
        if(checkArray.call(idx)){
            if(this._method==='start') _fvr[this._index].initialized = true;
            this._method = next;
            this._method.call(this,val,cb);
        }
        var cmd = I2CCMDs[_fvr[this._index][this._method][idx].cmd];
        waterfall.call(this, cmd, idx, val, next, cb);   
    }
    
    if(!cmp.bytes) return _fvr[this._index].i2c.writeByte(cmp.byte, function(err){
        if(err) fvr.err;
       afterWrite.call(fvr);
    });
  
    _fvr[this._index].i2c.writeBytes(cmp.byte, cmp.bytes, function(err){
        if(err) fvr.err;
        afterWrite.call(fvr);
    });
}

function I2CRead(idx, val, cb){
    var fvr = this;
    var cmp = idx ? _fvr[this._index][this._method][idx] : _fvr[this._index][this._method];
    if(!cmp.lng) return _fvr[this._index].i2c.readByte(cmp.byte, function(err, data){
       if(err) fvr.err = err; 
        cb.call(this, data);
    });
    
    _fvr[this._index].i2c.readBytes(cmp.byte, cmp.lng, function(err, data){
        if(err) fvr.err = err;
        cb.call(this, data);
    });
       
}


function get(cb){ // return gpio value
    var fvr = this;
    if(_fvr[this._index].get) return _fvr[this._index].get.call(fvr,function(val){
        if(_fvr[fvr._index].link)return cb.call(fvr,val[_fvr[fvr._index].return_as]);
        cb.call(fvr, val); 
    });
    switch(_fvr[this._index].interface) {
        case 'gpio' :
            cb.call(this,_fvr[this._index].gpio.value());
            break;
        case 'i2c' :
          
            break;
    }
}

function set(val,cb){ //set gpio value
    var fvr = this;
    if(_fvr[this._index].set) return _fvr[this._index].set.call(fvr,val,function(){
        cb.call(fvr);   
    });
    switch(_fvr[this._index].interface) {
    case 'gpio' :
        val = checkGPIOVal.call(this,val);
        _fvr[this._index].gpio.value(val);        
        if(cb) cb.call(this);
        break;
    case 'i2c' :

        break;
    }
}


function checkGPIOVal(val){
    if(typeof val==='boolean') return val;
    if(typeof val==='string') return val.toLowerCase()==='high'? true : false;
    if(typeof val==='number') return val > 0 ? true : false;
    return this.onError.call('invalid value '+val+' to set GPIO.',46, file);
}


function passComponentsToSetGpio(val, key, cb){
/*gets a list of components to set the gpio of, checks that address is a structure
  or a directly addressed component, and then sets the gpio 
*/
  for(var i = 0; i<this._component_matches.length; i++){
        setup_fvr.call(this,i);
        if(_fvr[this._index].structure){
            for( key in _fvr[this._index].structure){
                this._index = this._index['structure'][key];
                if(!_fvr[this._index].initialized){
                    return initializeComponent.call(this,val,'set',cb);   
                } else {
                    return set.call(this, val,cb); //address is contained in an object referrenced by the structure of the I/O             
                }
            }
        } else {
		      if(!_fvr[this._index].initialized){
			   return initializeComponent.call(this,val,'set',cb);
		      } else {
                  
                return set.call(this,val,cb)
            }
        }
    }
}


var _set = function(x, key,cb){
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

    passComponentsToSetGpio.call(this,x,key,cb);
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

function getComponentAsObject(cb){
    //the I/O is not directly addressed, but has an object of addresses.
    for( key in _fvr[this._index].structure){
        this._index = this._index['structure'][key]
        if(!_fvr[this._index].initialized){
            initializeComponent.call(this,null,'get',cb);   
        }
            get.call(this,i,cb)
    }
}


function setup_fvr(i){
    if(this._index) return this; //the index has already been set, so probably a call to this from a callback
    var ci = this._component_matches[i]; //component index
    this._index = ci;
    this._parent = ci;
    return this;
}

var _get = function(cb){
    for(var i=0; i<this._component_matches.length; i++){
        setup_fvr.call(this,i);
        if(_fvr[this._index].structure){ //not directly addressed, this is a group of  I/Os  
          return getComponentAsObject.call(cb);  
        } else {
           	if(!_fvr[this._index].initialized && _fvr[this._index].interface === 'gpio'){
			return initializeComponent.call(this,null,'get',cb);
            }
           return get.call(this,cb);
        }
    }
}

function addOnchange(dir, fn){
    if(typeof dir === 'function' && !fn){
        fn = dir;
        dir = 'both';
    }
    var fvr = this;    
    if(['both','rise','fall'].indexOf(dir)===-1) return this.onError.call(fvr,'invalid value for watching changes. Valid watches are both, rise, fall',200, file);

	for(var i=0;i<this._component_matches.length;i++){
        setup_fvr.call(this,i);
		 if(_fvr[this._index].structure){
            for(key in _fvr[this._index].structure){
                this._index = this._index['structure'][key];
                if(!_fvr[this._index].initialized){
                     return initializeComponent.call(this,dir,'change',fn);   
                }else {
                   return _fvr[this._index].component.gpio.on(dir,fn);
                }
            }
        } else {   
		  if(!_fvr[this._index].initialized){
			return initializeComponent.call(this,dir,'change',fn);
          }
            return  _fvr[this._index].gpio.on(dir,fn);
        }
		
	}
}




var onChange = function(dir,fn){ 
    	addOnchange.call(this,dir, fn);  
}

module.exports.get = _get;
module.exports.set = _set;        
module.exports.onChange = onChange;
