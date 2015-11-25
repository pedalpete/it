var SPI = process.env.DEVICE_MOCK_PATH ?
	require(process.env.DEVICE_MOCK_PATH + 'spi') :
	require('spi');
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
	var read = device.get ? new Buffer(device.get) : new Buffer(device.set.length);
	device._spi.open();
	return device._spi.transfer(write, read, function(res, buf) {
		respond.call(fvr, res, new Int32Array(buf));
		device._spi.close();
	});
}

function init() {
	var fvr = this;
	var device = _fvr[this._index];
	device._spi = new SPI.Spi(device.address, {
		'mode': SPI.MODE[device.mode],
		'chipSelect': SPI.CS[device.chipSelect || 'none']
	});
	device.initialized = true;
	spi.call(fvr);
}
module.exports = function() {
	var fvr = this;
	var device = _fvr[this._index];
	if (!_fvr[fvr._index].initialized) return init.call(fvr);
	spi.call(fvr);
};