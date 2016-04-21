
exports.openSync = function(setupObj) {
	I2C.setup(setupObj);
}

exports.writeI2cBlock = function(addr, cmd, length, buffer, cb) {
	I2C.writeTo(address, cmd);
	i2cCb(null )
}