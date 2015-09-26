var gpio =  require('os').arch() === 'arm' ? require('pi-pins'): require('../../tests/mocks/pi-pins.js');
var file = 'protocols/gpio.js';

var DIRECTION_OBJ = {
    'led':'out',
    'button':'in',
    'sensor':'in',
    'temperature': 'in'
}

function initialize() {
     if(!_fvr[this._index].direction){
        _fvr[this._index].direction = _fvr[this._parent].direction || DIRECTION_OBJ[_fvr[this._parent].type];
    }
    _fvr[this._index].gpio = gpio.connect(_fvr[this._index].address);
    _fvr[this._index].gpio.mode(_fvr[this._index].direction); 
    _fvr[this._index].initialized = true;
}

function findPostAction(){
    var method = this._method.name ? this._method.name : this._method;
    if(_fvr[this._index][method] && _fvr[this._index][method].post_action) return _fvr[this._index][method].post_action;
    return _fvr[this._index].post_action || false;
}

function postDevice(){
	if (!_fvr[this._index].gpio) console.log(_fvr[this._index]);
    var val = _fvr[this._index].gpio.value();
    var post_action = findPostAction.call(this);
    if(post_action && this._callback) return this._callback.call(this, post_action.call(this,val));
    if(post_action) return post_action.call(this, val);
    if(this._callback) return this._callback.call(this,val);
    return;
}


function checkGPIOVal(){
    if(typeof this._valueToSet === 'boolean') return;
    if(typeof this._valueToSet === 'string') return this._valueToSet.toLowerCase()==='high'? true : false;
    if(typeof this._valueToSet === 'number') return this._valueToSet > 0 ? true : false;
    return this.onError.call('invalid value ' + this._valueToSet +' to set GPIO.',46, file);
}

function set(val) {
    val = checkGPIOVal.call(this,val);
    _fvr[this._index].gpio.value(val);        
    if(this._callback) this._callback.call(this);
}

module.exports  = {
    initialize: initialize,
    set: set,
	postDevice: postDevice
}