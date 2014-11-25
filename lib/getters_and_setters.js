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

var I2CCMDs = {
        'write': 'write',
        'read': 'read',
        'get': 'read',
        'set': 'write'
    }

function initializeComponent(val,next,cb){
    switch(_fvr[this._index].interface || _fvr[this._parent].interface) {
        case 'i2c':
            if(_fvr[this._index].init){
                this._method='init';
                this._next = next;
            } else {
            this._method = next;
            }
            return initializeI2C.call(this,val,cb);
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


function checkArray(){
    var isArray =  Array.isArray(_fvr[this._index][this._method]);
    if(!isArray) return false;
    if(isArray && !this._method_count) this._method_count=0;
    return _fvr[this._index][this._method].length>this._method_count;
}

function waterfall(val, cb){
    if(checkArray.call(this)){
        return I2C.call(this, val, cb)
    }
    if(this._method_count) delete this._method_count;
    if(this._next) {
        this._method = this._next;
        delete this._next;
    }
    I2C.call(this, val, cb);
}

function initializeI2C(val, cb){
    if(_fvr[this._index].address===undefined) return this.onError("i2c bus address must be specified");
    var path = _fvr[this._index].i2c_path || _fvr.i2c_path || '/dev/i2c-1';
    if(!_fvr[this._index].i2c) _fvr[this._index].i2c= new i2c(_fvr[this._index].address,{device: path, debug: false});
    if(!this._method!=='init') _fvr[this._index].initialized = true; //no init sequence needed
    if(checkArray.call(this)) return waterfall.call(this, val, cb);
    return I2C.call(this, val, cb);
}

function i2ccmd(cmp){
    var cmd = I2CCMDs[cmp.cmd]=== 'write' ? 'writeByte' : 'readByte';
    if(cmp.bytes) cmd+='s';
    return cmd;
    
}

function I2C(val, cb){
    var fvr = this;
    var cmp = this._method_count!==undefined ? _fvr[this._index][this._method][this._method_count] : _fvr[this._index][this._method];
    if(!cmp.bytes) return _fvr[this._index].i2c[i2ccmd(cmp)](cmp.byte, function(err,i2cVal){
        if(err) fvr.err;

        if(!checkArray.call(fvr)) return cb.call(fvr,i2cVal);
       afterWrite.call(fvr, val, cb);
    });
  
    var newVal;  
    if(typeof cmp.bytes === 'function') newVal = cmp.bytes.call(fvr,val);
    if(!val) newVal = cmp.bytes;
    if(!newVal) newVal = val;
    _fvr[this._index].i2c[i2ccmd(cmp)](cmp.byte, newVal, function(err,i2cVal){
        if(err) fvr.err;
        if(!checkArray.call(fvr) && cb) return cb.call(fvr, i2cVal);
        if(!checkArray.call(fvr)) return;
        afterWrite.call(fvr, val, cb);
    });
}

 function afterWrite(val, cb){
     var fvr = this,
         wait = null;
      if(this.err) this.onError('error writing i2c', err);
        if(_fvr[this._index][this._method][this._method_count].wait){
               wait = _fvr[this._index][this._method][this._method_count].wait;
        }
        this._method_count++;
        if(checkArray.call(this)){
            if(this._method==='init')_fvr[this._index].initialized = true;
        }
        if(wait!==null) return setTimeout(function(){
                    waterfall.call(fvr, val, cb);   
                    }, wait)
        
        waterfall.call(this, val, cb);   
    }


function isFunc(typ){
    return _fvr[this._index][typ] && typeof _fvr[this._index][typ]  === 'function';
}

function get(cb){ // return gpio value
    var fvr = this;
    if(isFunc.call(this,'get')) return _fvr[this._index].get.call(fvr,function(val){
        if(fvr._return_as)return cb.call(fvr,val[fvr._return_as]);
        cb.call(fvr, val); 
    });
    switch(_fvr[this._index].interface) {
        case 'gpio' :
            cb.call(this,_fvr[this._index].gpio.value());
            break;
        case 'i2c' : 
            I2C.call(fvr,null,cb);
            break;
    }
}




function set(val,cb){ //set gpio value
    
    var fvr = this;
    if(isFunc.call(this,'set')) return _fvr[this._index].set.call(fvr,val,function(){
        cb.call(fvr);   
    });
    switch(_fvr[this._index].interface) {
    case 'gpio' :
        val = checkGPIOVal.call(this,val);
        _fvr[this._index].gpio.value(val);        
        if(cb) cb.call(this);
        break;
    case 'i2c' :
        I2C.call(fvr,val,cb);
        break;
    }
}


function checkGPIOVal(val){
    if(typeof val==='boolean') return val;
    if(typeof val==='string') return val.toLowerCase()==='high'? true : false;
    if(typeof val==='number') return val > 0 ? true : false;
    return this.onError.call('invalid value '+val+' to set GPIO.',46, file);
}


function passComponentsToSet(val, key, cb){
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

    passComponentsToSet.call(this,x,key,cb);
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


function getLinkIndex(){
    var self = this;
    return _fvr.map(function(f,idx){
            if(f.name===_fvr[self._index].link) return idx;
    }).filter(function(f){ if(f) return f })[0];
}

function setup_fvr(i){
    if(this._index) return this; //the index has already been set, so probably a call to this from a callback
    var ci = this._component_matches[i]; //component index
    var cmp = _fvr[ci];
    this._index = ci;
    this._parent = ci;
    if(cmp.link){
        this._index = getLinkIndex.call(this);   //getting the index of the linked component
        this._original_index = ci; //the original index of the searched component
        this._return_as = _fvr[ci].return_as;
    }
    
    return this;
}

var _get = function(cb){
    for(var i=0; i<this._component_matches.length; i++){
        setup_fvr.call(this,i);
        if(_fvr[this._index].structure){ //not directly addressed, this is a group of  I/Os  
          return getComponentAsObject.call(cb);  
        } else {
           	if(!_fvr[this._index].initialized){
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
