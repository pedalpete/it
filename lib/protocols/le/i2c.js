function addMethodsToI2C() {
	
	I2C.writeI2cBlock = function(addr, cmd, length, buffer, cb) {
		var i2cResponse = I2C.writeTo(addr, cmd) || null;
		var len = i2cResponse ? i2cResponse.length : 0;
		cb(null, len, i2cResponse);
	}
	
	I2C.readI2cBlock = function(addr, cmd, length, buffer, cb) {
		var i2cResponse = I2C.readFrom(addr, length);
		cb(null, i2cResponse.length, i2cResponse);
	}
}

exports.openSync = function(setupObj) {
	addMethodsToI2C();
	I2C.setup(setupObj);
	return I2C; 
};
