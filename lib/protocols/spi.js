var SPI = process.env.DEVICE_MOCK_PATH ?
	require(process.env.DEVICE_MOCK_PATH + 'spi') :
	require('pi-spi');
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

function init() {
	var fvr = this;
	var device = _fvr[this._index];
	device._spi = new SPI.initialize(device.address);
	device.initialized = true;
	spi.call(fvr);
}
module.exports = function() {
	var fvr = this;
	var device = _fvr[this._index];
	if (!_fvr[fvr._index].initialized) return init.call(fvr);
	spi.call(fvr);
};