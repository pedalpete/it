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
var writeByte = function(address, addr, cmd, cb) {
	increment.call(this,'writeByte',[address, addr, cmd]);
	cb.call(this, null, returnObj.call(this,[addr, cmd]));
};

var readByte = function(address, addr, cb) {
	increment.call(this,'readByte', [address, addr]);
	cb.call(this, null, returnObj.call(this,[addr]));
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
		writeByte: [],
		readByte: [],
		open: []
	}
}
var mockObj = function(address) {
	return {
		address: address,
		writeByte: writeByte,
		readByte: readByte,
		on: on,
		stream: stream,
		counts: {
			writeByte: [],
			readByte: [],
			open: []
		},
		reset: reset
	}
};

var I2C = {
	openSync: openSync
}

module.exports = I2C;