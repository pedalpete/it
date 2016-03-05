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

function spi() {
	var fvr = this;
	var device = _fvr[this._index];
	var write = device.set ? new Buffer(device.set) :
		new Buffer(device.get.length);
	var read = device.get ? device.get.length : device.set.length;
	return device._spi.transfer(write, read, function(res, buf) {
		respond.call(fvr, res, new Int32Array(buf));
	});
}

function runSPIMethod(method) {
	var fvr = this;
	var action = method || componentUtils.getMethod.call(fvr);
	var spiMethod =_fvr[fvr._index][action];
	if (!Array.isArray(spiMethod)) spiMethod = [spiMethod];
	var arrayFuncs = spiMethod.map(function(cmdObj, idx) {
		var cb = selectCallback.call(fvr, action, idx);
		return function(cb) {
			spi.call(fvr, cmdObj, cb);
		}
	});
	async.series(arrayFuncs , function(err, val){
		if (action === 'init') return runSPIMethod.call(fvr);
		var cb = selectCallback.call(fvr, action, _fvr[fvr._index][action].length - 1);
		cb.call(fvr, val[val.length-1]);
	});
}
function init() {
	var fvr = this;
	var device = _fvr[this._index];
	device._spi = new SPI.initialize(device.address);
	device.initialized = true;
	// Does the device have an initialize sequence or process? 
	if (_fvr[fvr._index].init) return runSPIMethod('init');
	spi.call(fvr);
}

module.exports = function() {
	var fvr = this;
	var device = _fvr[this._index];
	if (!_fvr[fvr._index].initialized) return init.call(fvr);
	spi.call(fvr);
};