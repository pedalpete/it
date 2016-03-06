var I2C =  process.env.DEVICE_MOCK_PATH ?
	require(process.env.DEVICE_MOCK_PATH + '/i2c') :
	require('i2c-bus');
var async = require('async');
var componentUtils = require('../componentUtils');

function getI2cFunc(i2cCmd) {
	if (i2cCmd.type === 'read') return 'readI2cBlock';
	if (i2cCmd.type === 'write') return 'writeI2cBlock';
	return i2cCmd.type;
}

function i2c(i2cCmd, cb) {
	var fvr = this;
	function i2cCallback(err, length, val) {
		if (err) fvr.err;
		if (i2cCmd.wait) {
			return setTimeout(function() {
				cb.call(fvr, err, val);
			}, i2cCmd.wait);
		}
		return	cb.call(fvr, err, val);
	}
	var address = fvr._component.address;
	if (!i2cCmd) {
		var err = 'error calling i2c, get or set parameters not defined';
		this.onError(err);
		if (this._callback) this._callback.call(fvr, {err: err});
		return;
	}

	var i2cFunc = getI2cFunc(i2cCmd);
	var newVal = componentUtils.getValueToSet.call(this, i2cCmd);

	if (!Buffer.isBuffer(newVal)) newVal = new Buffer(newVal);
	var valLength = newVal.length || 0;
	_fvr.i2c[i2cFunc](address, i2cCmd.cmd, valLength, newVal, i2cCallback);
}

function returnCallback(i2cVal) {
	var fvr = this;
	if (_fvr[fvr._index].formatOutput) {
		componentUtils.emitEvents.call(fvr,
			_fvr[fvr._index].formatOutput.call(fvr, i2cVal));
		return fvr._callback.call(fvr,
			_fvr[fvr._index].formatOutput.call(fvr, i2cVal));
	}
	componentUtils.emitEvents.call(fvr, i2cVal);
	if (fvr._returnAs) return fvr._callback.call(fvr, i2cVal[this._returnAs]);
	fvr._callback.call(fvr, i2cVal);
}

function runI2CMethod(method) {
	var fvr = this;
	var action = method || componentUtils.getMethod.call(fvr);
	var i2cMethod = _fvr[fvr._index][action];
	if (!Array.isArray(i2cMethod)) i2cMethod = [i2cMethod];
	var arrayFuncs = i2cMethod.map(function(i2cCmd, idx) {
		var cb = componentUtils.selectCallback.call(fvr, action, idx, runI2CMethod);
		return function(cb) {
			i2c.call(fvr, i2cCmd, cb);
		};
	});
	async.series(arrayFuncs , function(err, val) {
		if (action === 'init') return runI2CMethod.call(fvr);
		var cb = componentUtils.selectCallback.call(fvr, action,
			(_fvr[fvr._index][action].length - 1),
			runI2CMethod, returnCallback);
		cb.call(fvr, val[val.length - 1]);
	});
}

module.exports = function() {
	var fvr = this;

	if (_fvr[fvr._index].path === undefined) {
		return fvr.onError('i2c bus address must be specified');
	}

	if (!_fvr.i2c) {
		_fvr.i2c = I2C.openSync(_fvr[fvr._index].path);
	}

	if (!_fvr[fvr._index].init || _fvr[fvr._index].initialized) {
		if (!_fvr[fvr._index].initialized) _fvr[fvr._index].initialized = true; //no init sequence needed
		return runI2CMethod.call(fvr);
	}
	// if this device has not been initialized, initialize then run the required method
	runI2CMethod.call(fvr, 'init');
};