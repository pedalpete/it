var SPI =  require('os').arch() === 'arm' ? require('spi'): require('../../tests/mocks/spi.js');

function respond(res, buf) {
	this._callback.call(this, buf);	
}

function spi(){
	var fvr = this;
	var device = _fvr[this._index];
	var write = device.set ? new Buffer(device.set) : new Buffer(device.get.length);
	var read = device.get ? new Buffer(device.get) : new Buffer(device.set.length);
	return device._spi.transfer(write, read, function(res, buf){
		respond.call(fvr, res, new Int32Array(buf));
	});
	
}

function init() {
	var fvr = this;
	var device = _fvr[this._index];
	device._spi = new SPI.Spi(device.address, {
		'mode': SPI.MODE[device.mode],
		'chipSelect': SPI.CS[device.chipSelect || 'none']
	});
	
	device._spi.open();
	device.initialized = true;
	spi.call(fvr);
}
module.exports = function() {
	var fvr = this;
	var device = _fvr[this._index];
	if(!_fvr[fvr._index].initialized) init.call(fvr);
	spi.call(fvr);
}