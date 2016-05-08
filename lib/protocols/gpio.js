var Gpio = process.env.DEVICE_MOCK_PATH ?
	require(process.env.DEVICE_MOCK_PATH + 'gpio') :
	require('onoff').Gpio;

var file = 'protocols/gpio.js';
var componentUtils = require('../component_utils');

function initialize() {
	var component = componentUtils.getComponent.call(this);
	if (!component.direction && _fvr[this._parent] &&
		_fvr[this._parent].direction) {
		component.direction = _fvr[this._parent].direction;
	}
	component.gpio = new Gpio(component.address, component.direction);
	component.initialized = true;
}

function returnCallback(val, cb) {
	var self = this;
	if (_fvr[self._index].formatOutput && cb) {
		return cb.call(self,
		_fvr[self._index].formatOutput.call(self, val));
	}
	if (self._returnAs) return cb.call(self, val[self._returnAs]);
	if (cb) return cb.call(self, val);
	return;
}

function get() {
	var self = this;
	_fvr[this._index].gpio.read(function(err, val) {
		if (err) return self.onError.call(self, 'error getting gpio ', err);
		returnCallback.call(self, val, self._callback);
	});
}

function isValidVal() {
	if (typeof this._valueToSet === 'number') return true;
	return this.onError.call(this, 'invalid value ' +
		this._valueToSet + ' to set GPIO.', 46, file);
}

function set() {
	var self = this;
	var val = this._valueToSet;
	if (!isValidVal.call(this, val)) return;
	var component = componentUtils.getComponent.call(this);
	component.gpio.write(val, function(err, val) {
		if (err) return self.onError.call(self, err);
		if (self._formatOutput) val = _fvr[self._index].formatOutput.call(self, val);
		if (self._returnAs) return val[self._returnAs];
		self._callback.call(self, val);
	});
}

function watch() {
	var fvr = this;
	var component = componentUtils.getComponent.call(this);
	component.gpio.watch(this._callback);
}

function unwatch() {
	var self = this;
	var component = componentUtils.getComponent.call(self);
	console.log('unwatch');
	componentUtils.removeWatch.call(self);
	// remove watched intervals
	component.gpio.unwatch(this._callback);
}
module.exports  = {
	initialize: initialize,
	set: set,
	get: get,
	watch: watch,
	unwatch: unwatch
};