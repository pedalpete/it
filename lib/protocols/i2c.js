var I2C =  process.env.DEVICE_MOCK_PATH ?
	require(process.env.DEVICE_MOCK_PATH + '/i2c') :
	require('i2c-bus');
var componentUtils = require('../component_utils');

function getI2cFunc(i2cCmd) {
	if (i2cCmd.type === 'read') return 'readI2cBlock';
	if (i2cCmd.type === 'write') return 'writeI2cBlock';
	return i2cCmd.type;
}

function i2c(i2cCmd, cb) {
	var i2cCb = function(err, length, val) {
		cb(err, val);
	};
	var i2cFunc = getI2cFunc(i2cCmd);
	var val = i2cCmd.val;
	if (!Buffer.isBuffer(val)) val = new Buffer(val);
	var valLength = val.length || 0;
	_fvr.i2c[i2cFunc](i2cCmd.address, i2cCmd.cmd, valLength, val, i2cCb);
}

module.exports = function() {
	var fvr = this;

	if (_fvr[fvr._index].path === undefined) {
		return fvr.onError(this, 'i2c bus address must be specified');
	}
	if (!_fvr.i2c) {
		_fvr.i2c = I2C.openSync(_fvr[fvr._index].path);
	}
	var i2cMethod = componentUtils.runMethod.bind(fvr);
	if (!_fvr[fvr._index].init || _fvr[fvr._index].initialized) {
		if (!_fvr[fvr._index].initialized) _fvr[fvr._index].initialized = true; //no init sequence needed
		return i2cMethod(i2c);
	}
	// if this device has not been initialized, initialize then run the required method
	i2cMethod(i2c, true);
};