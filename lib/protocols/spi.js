var SPI = process.env.DEVICE_MOCK_PATH ?
	require(process.env.DEVICE_MOCK_PATH + 'spi') :
	require('pi-spi');
var componentUtils = require('../component_utils');

function respond(res, val) {
	componentUtils.emitEvents.call(this, val);
	if (this._component.formatOutput) {
		return this._callback.call(this,
			this._component.formatOutput.call(this, val));
	}
	this._callback.call(this, val);
}

function getWriteValue(cmd) {
	if (cmd.val) return cmd.val;
	if (cmd.length) return cmd.length;
	return 0;
}

function spi(cmd, cb) {
	var write = getWriteValue(cmd);
	if (!Buffer.isBuffer(write)) write = new Buffer(write);
	var length = cmd.length ? cmd.length : write.length || 0;
	return _fvr[cmd._componentIndex]._spi.transfer(write,
		length, function(err, data) {
			cb(err, data);
		}
	);
}

function init() {
	var fvr = this;
	var device = _fvr[this._index];
	device._spi = new SPI.initialize(device.address);
	var spiMethod = componentUtils.runMethod.bind(fvr);
	// Does the device have an initialize sequence or process?
	if (device.init) return spiMethod(spi, true);
	device.initialized = true;
	spiMethod(spi);
}

module.exports = function() {
	var fvr = this;
	var device = _fvr[this._index];
	if (!_fvr[fvr._index].initialized) return init.call(fvr);
	var spiMethod = componentUtils.runMethod.bind(fvr);
	spiMethod(spi);
};