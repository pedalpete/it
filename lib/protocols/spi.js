var SPI = process.env.DEVICE_MOCK_PATH ?
	require(process.env.DEVICE_MOCK_PATH + 'spi') :
	require('pi-spi');

var async = require('async');
var componentUtils = require('../componentUtils');

function respond(res, val) {
	componentUtils.emitEvents.call(this, val);
	if (this._component.formatOutput) {
		return this._callback.call(this,
			this._component.formatOutput.call(this, val));
	}
	this._callback.call(this, val);
}

function returnCallback(val) {
	var fvr = this;
	if (_fvr[fvr._index].formatOutput) {
		componentUtils.emitEvents.call(fvr,
			_fvr[fvr._index].formatOutput.call(fvr, val));
		return fvr._callback.call(fvr,
			_fvr[fvr._index].formatOutput.call(fvr, val));
	}
	componentUtils.emitEvents.call(fvr, val);
	if (fvr._returnAs) return fvr._callback.call(fvr, val[this._returnAs]);
	fvr._callback.call(fvr, val);
}

function getWriteValue(cmd) {
	if (cmd.formatInput) return componentUtils.getValueToSet.call(this, cmd);
	if (cmd.val) return cmd.val;
	if (cmd.length) return cmd.length;
	return 0;
}

function spi(cmd, cb) {
	var fvr = this;
	var write = getWriteValue.call(this, cmd);
	if (!Buffer.isBuffer(write)) write = new Buffer(write);
	var length = cmd.length ? cmd.length : write.length || 0;
	return _fvr[fvr._index]._spi.transfer(write, length, function(err, data) {
		cb.call(fvr, err, data);
	});
}

function runSPIMethod(method) {
	var fvr = this;
	var action = method || componentUtils.getMethod.call(fvr);
	var spiMethod = _fvr[fvr._index][action];
	if (!Array.isArray(spiMethod)) spiMethod = [spiMethod];
	var arrayFuncs = spiMethod.map(function(cmdObj, idx) {
		var cb = componentUtils.selectCallback.call(fvr, action, idx, runSPIMethod);
		return function(cb) {
			spi.call(fvr, cmdObj, cb);
		};
	});
	async.series(arrayFuncs , function(err, val) {
		if (action === 'init') return runSPIMethod.call(fvr);
		var cb = componentUtils.selectCallback.call(fvr, action,
			(_fvr[fvr._index][action].length - 1),
			runSPIMethod, returnCallback);
		cb.call(fvr, val[val.length - 1]);
	});
}

function init() {
	var fvr = this;
	var device = _fvr[this._index];
	device._spi = new SPI.initialize(device.address);
	device.initialized = true;
	// Does the device have an initialize sequence or process?
	if (device.init) return runSPIMethod.call(fvr, 'init');
	runSPIMethod.call(fvr);
}

module.exports = function() {
	var fvr = this;
	var device = _fvr[this._index];
	if (!_fvr[fvr._index].initialized) return init.call(fvr);
	runSPIMethod.call(fvr);
};