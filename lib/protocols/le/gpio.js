// If this is not a build for LE devices, include the build mocks
// These are globals provided by Espruino when in a build environment
if (!process.env.BUILD) {
	var digitalWrite = function(pin, val) {
		return val;
	};
}

function read() {
	console.log(this);
}

function write(val, cb) {
	if (!this.analog) digitalWrite(this.pin, val);
	cb.call(this, null, val);
}

module.exports = function(pin, direction) {
	this.pin = pin;
	this.direction = direction;
	this.read = read;
	this.write = write;
	return this;
};