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



function init() {
	var fvr = this;
	var device = _fvr[this._index];
	device._spi = new SPI.initialize(device.address);
	device.initialized = true;
	// Does the device have an initialize sequence or process?
	if (device.init) return componentUtils.runMethod.call(fvr, spi, 'init');
	componentUtils.runMethod.call(fvr, spi);
}

module.exports = function() {
	var fvr = this;
	var device = _fvr[this._index];
	if (!_fvr[fvr._index].initialized) return init.call(fvr);
	componentUtils.runMethod.call(fvr, spi);
};