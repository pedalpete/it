var I2C =  process.env.DEVICE_MOCK_PATH ?
	require(process.env.DEVICE_MOCK_PATH + '/i2c') :
	require('i2c');
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

function getI2Ccmd(cmp, callback) {
	var cmd = I2CCMDs[cmp.cmd] === 'write' ? 'writeByte' : 'readByte';
	if (cmp.bytes) cmd += 's';
	return cmd;
}

function i2c(i2cCmd, callback) {
	var fvr = this;
	if (!i2cCmd) {
		var err = 'error calling i2c, get or set parameters not defined';
		this.onError(err);
		if (this._callback) this._callback.call(fvr, {err: err});
		return;
	}
	if (!i2cCmd.bytes) {
		return _fvr[this._index].i2c[getI2Ccmd(i2cCmd)](i2cCmd.byte,
			function(err, i2cVal) {
				if (err) fvr.err;
				if (i2cCmd.wait) {
					return setTimeout(function() {
						callback(err, i2cVal);
					}, i2cCmd.wait);
				}
				return	callback(err, i2cVal);
			}
		);
	};
	var newVal;
	if (typeof i2cCmd.bytes === 'function') {
		newVal = i2cCmd.bytes.call(fvr, this._valueToSet);
	}
	if (!this._valueToSet) newVal = i2cCmd.bytes;
	if (!newVal) newVal = this._valueToSet;
	_fvr[this._index].i2c[getI2Ccmd(i2cCmd)](i2cCmd.byte, newVal,
		function(err, i2cVal) {
			if (err) fvr.err;
			if (i2cCmd.wait) {
				return setTimeout(function() {
					callback(err, i2cVal);
				}, i2cCmd.wait);
			}
			return	callback(err, i2cVal);
		}
	);
}

function returnCallback(i2cVal) {
	var fvr = this;
	if (_fvr[fvr._index].formatOutput) {
		componentUtils.emitEvents.call(fvr, _fvr[fvr._index].formatOutput.call(fvr, i2cVal));
		return fvr._callback.call(fvr,
			_fvr[fvr._index].formatOutput.call(fvr, i2cVal));
	}
	componentUtils.emitEvents.call(fvr, i2cVal);
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

	if (_fvr[fvr._index].address === undefined) {
		return fvr.onError('i2c bus address must be specified');
	}
	var path = _fvr[fvr._index].i2cPath || _fvr.i2cPath || '/dev/i2c-1';

	if (!_fvr[fvr._index].i2c) {
		_fvr[fvr._index].i2c = new I2C(_fvr[fvr._index].address,
			{device: path, debug: false});
	}

	if (!_fvr[fvr._index].init || _fvr[fvr._index].initialized) {
		if (!_fvr[fvr._index].initialized) _fvr[fvr._index].initialized = true; //no init sequence needed
		return runI2CMethod.call(fvr);
	}
	runAsyncInit.call(fvr);
};