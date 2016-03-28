function increment(cmd, evt) {
	_fvr.i2c.counts[cmd].push(evt.toString());
}

var openSync = function(address) {
	_fvr.i2c = new MockObj(address);
	increment('open', 1);
	return _fvr.i2c;
};

var writeI2cBlock = function(address, cmd, length, val, cb) {
	increment('writeI2cBlock',[address, cmd, Buffer.isBuffer(val)]);
	cb.call(this, null, length, val);
};

var readI2cBlock = function(address, cmd, length, val, cb) {
	increment('readI2cBlock', [address, cmd, Buffer.isBuffer(val)]);
	cb.call(this, null, length, val);
};
var on = function(data) {
	var res;
	setTimeout(
		function() {
			return res = 'on called with on data';
		},
	2000);
};

var stream = function(command, length, delay) {
	var Stream = new mockstream.MockDataStream({
		chunkSize: length,
		streamLength: length * 10
	});
	Stream.start();
};

var reset = function() {
	return this.count = {
		writeI2cBlock: [],
		readI2cBlock: [],
		open: []
	};
};

var MockObj = function(address) {
	return {
		address: address,
		writeI2cBlock: writeI2cBlock,
		readI2cBlock: readI2cBlock,
		on: on,
		stream: stream,
		counts: {
			writeI2cBlock: [],
			readI2cBlock: [],
			open: []
		},
		reset: reset
	};
};

var I2C = {
	openSync: openSync
};

module.exports = I2C;