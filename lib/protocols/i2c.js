var I2C =  process.env.DEVICE_MOCK_PATH ?
	require(process.env.DEVICE_MOCK_PATH + '/i2c') :
	require('i2c-bus');
var async = require('async');
var componentUtils = require('../componentUtils');
var I2CCMDs = {
	'write': 'write',
	'read': 'read',
	'get': 'read',
	'set': 'write'
};

function getI2cAction() {
	return this._watch ? this._watch.change : this._method.name || this._method;
}


function i2c(i2cCmd, callback) {
	var fvr = this;
	function i2cCallback(err, i2cVal) {
		if (err) fvr.err;
		if (i2cCmd.wait) {
			return setTimeout(function() {
				callback(err, i2cVal);
			}, i2cCmd.wait);
		}
		return	callback(err, i2cVal);
	}
	var address = fvr._component.address;
	if (!i2cCmd) {
		var err = 'error calling i2c, get or set parameters not defined';
		this.onError(err);
		if (this._callback) this._callback.call(fvr, {err: err});
		return;
	}
	var newVal;
	if (typeof i2cCmd.cmd === 'function') {
		newVal = i2cCmd.cmd.call(fvr, this._valueToSet);
	}
	
	
	if (i2cCmd.type === 'read') return _fvr.i2c.readByte(address, i2cCmd.addr, i2cCallback);
	if (!this._valueToSet) newVal = i2cCmd.cmd;
	if (!newVal) newVal = this._valueToSet;
	_fvr.i2c.writeByte(address, i2cCmd.addr, newVal, i2cCallback);
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

function runI2CMethod() {
	var fvr = this;
	var method = getI2cAction.call(fvr);

	var i2cMethod = _fvr[fvr._index][method];
	if (Array.isArray(i2cMethod)) {
		async.forEachSeries(i2cMethod, function(i2cCmd, callback) {
			i2c.call(fvr, i2cCmd, callback);
		}, function(err, val) {
			returnCallback.call(fvr, val);
			
		});
	} else {
		i2c.call(fvr, i2cMethod, function(err, val) {
			return returnCallback.call(fvr, val);
			
		});
	}
	
}

function runAsyncInit() {
	var fvr = this;
	var i2cMethod = _fvr[fvr._index].init;

	if (Array.isArray(i2cMethod)) {
		async.forEachSeries(i2cMethod, function(i2cCmd, callback) {
			i2c.call(fvr, i2cCmd, callback);
		}, function(err, val) {
			if (err) console.log('err init', err);
			_fvr[fvr._index].initialized = true;
			_fvr[fvr._index]._eventEmitter.emit('initialized');
		});
	} else {
		i2c.call(fvr, i2cMethod, function() {
			_fvr[fvr._index].initialized = true;
			_fvr[fvr._index]._eventEmitter.emit('initialized');
		});
	}
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
	runAsyncInit.call(fvr);
};