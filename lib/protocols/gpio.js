var gpio = process.env.DEVICE_MOCK_PATH ?
	require(process.env.DEVICE_MOCK_PATH + 'pi-pins') :
	require('pi-pins');

var file = 'protocols/gpio.js';

var  directionObj = {
	'led': 'out',
	'button': 'in',
	'sensor': 'in',
	'temperature': 'in'
};

function initialize() {
	if (!_fvr[this._index].direction) {
		_fvr[this._index].direction = _fvr[this._parent].direction ||
			directionObj[_fvr[this._parent].type];
	}
	_fvr[this._index].gpio = gpio.connect(_fvr[this._index].address);
	_fvr[this._index].gpio.mode(_fvr[this._index].direction);
	_fvr[this._index].initialized = true;
}

function findPostAction() {
	var method = this._method.name ? this._method.name : this._method;
	if (_fvr[this._index][method] && _fvr[this._index][method].postAction) {
		return _fvr[this._index][method].postAction;
	}
	return _fvr[this._index].postAction || false;
}

function postDevice() {
	if (!_fvr[this._index].gpio) console.log(_fvr[this._index]);
	var val = _fvr[this._index].gpio.value();
	var postAction = findPostAction.call(this);
	if (postAction && this._callback) {
		return this._callback.call(this, postAction.call(this,val));
	}
	if (postAction) return postAction.call(this, val);
	if (this._callback) return this._callback.call(this,val);
	return;
}

function checkGPIOVal() {
	if (typeof this._valueToSet === 'boolean') return;
	if (typeof this._valueToSet === 'string') {
		return this._valueToSet.toLowerCase() === 'high' ? true : false;
	}
	if (typeof this._valueToSet === 'number') return this._valueToSet > 0 ?
		true : false;
	return this.onError.call('invalid value ' +
		this._valueToSet + ' to set GPIO.', 46, file);
}

function set(val) {
	val = checkGPIOVal.call(this,val);
	_fvr[this._index].gpio.value(val);
	if (this._callback) this._callback.call(this);
}

module.exports  = {
	initialize: initialize,
	set: set,
	postDevice: postDevice
};