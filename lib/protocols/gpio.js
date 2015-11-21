var gpio = process.env.DEVICE_MOCK_PATH ?
	require(process.env.DEVICE_MOCK_PATH + 'pi-pins') :
	require('pi-pins');

var file = 'protocols/gpio.js';
var componentUtils = require('../componentUtils');

var  directionObj = {
	'led': 'out',
	'button': 'in',
	'sensor': 'in',
	'temperature': 'in'
};

function initialize() {
	var component = componentUtils.getComponent.call(this);
	if (!component.direction) {
		if (_fvr[this._parent] && _fvr[this._parent].direction) {
			component.direction = _fvr[this._parent].direction;
		} else {
			directionObj[component.type];
		}
	}
	component.gpio = gpio.connect(component.address);
	component.gpio.mode(component.direction);
	component.initialized = true;
}

function get() {
	var val = _fvr[this._index].gpio.value();
	if (_fvr[this._index].formatOutput && this._callback) {
		return this._callback.call(this,
			_fvr[this._index].formatOutput.call(this, val));
	}
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
	val = checkGPIOVal.call(this, val);
	var component = componentUtils.getComponent.call(this);
	component.gpio.value(val);
	if (this._callback) this._callback.call(this);
}

function attachEvent() {
	var component = componentUtils.getComponent.call(this);
	component.gpio.on(this._watch.change, this._callback);
}

module.exports  = {
	initialize: initialize,
	set: set,
	get: get,
	attachEvent: attachEvent
};