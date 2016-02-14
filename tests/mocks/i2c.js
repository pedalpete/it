function increment(cmd, evt) {
	this.counts[cmd].push(evt.toString());
}

function returnObj(cmds) {
	return {
		counts: this.counts,
		inputs: cmds.toString()
	};
}
var openSync = function(address) {
	var i2c = new mockObj(address);
	increment.call(i2c, 'open', 1);
	return i2c;
}
var writeI2cBlock = function(address, cmd, length, val, cb) {
	val = val.toString();
	increment.call(this,'writeI2cBlock',[address, val]);
	cb.call(this, null, returnObj.call(this,[address, val]));
};

var readI2cBlock = function(address, cmd, length, val, cb) {
	val = val.toString();
	increment.call(this,'readI2cBlock', [address, cmd]);
	cb.call(this, null, returnObj.call(this,[cmd]));
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
		writeI2cBlockByte: [],
		readI2cBlock: [],
		open: []
	}
}
var mockObj = function(address) {
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
	}
};

var I2C = {
	openSync: openSync
}

module.exports = I2C;