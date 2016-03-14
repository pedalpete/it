var Gpio = process.env.DEVICE_MOCK_PATH ?
	require(process.env.DEVICE_MOCK_PATH + 'gpio') :
	require('onoff').Gpio;

var file = 'protocols/gpio.js';
var componentUtils = require('../componentUtils');

function initialize() {
	var component = componentUtils.getComponent.call(this);
	if (!component.direction && _fvr[this._parent] &&
		_fvr[this._parent].direction) {
		component.direction = _fvr[this._parent].direction;
	}
	component.gpio = new Gpio(component.address, component.direction);
	component.initialized = true;
}

function get() {
	var self = this;
	_fvr[this._index].gpio.read(function(err, val) {
		if (err) return self.onError.call('error getting gpio ', err);
		if (_fvr[self._index].formatOutput && self._callback) {
			return self._callback.call(self,
				_fvr[self._index].formatOutput.call(self, val));
		}
		if (self._returnAs) return self._callback.call(self, val[self._returnAs]);
		if (self._callback) return self._callback.call(self, val);
		return;
	});
}

function isValidVal() {
	if (typeof this._valueToSet === 'number') return true;
	return this.onError.call('invalid value ' +
		this._valueToSet + ' to set GPIO.', 46, file);
}

function set() {
	var val = this._valueToSet;
	if (!isValidVal.call(this, val)) return;
	var self = this;
	var component = componentUtils.getComponent.call(this);
	component.gpio.write(val, function(err, val) {
		if (self._returnAs) return self._callback.call(self, val[self._returnAs]);
		if (self._callback) self._callback.call(self, val);
	});	
	
}

function attachEvent() {
	var component = componentUtils.getComponent.call(this);
	component.gpio.watch(this._callback);
}

module.exports  = {
	initialize: initialize,
	set: set,
	get: get,
	attachEvent: attachEvent
};