function read(cb) {
	// currently does not support analog read
	var val = digitalRead(this.pin);
	cb.call(this, null, val);
}

function write(val, cb) {
	if (Number.isInteger(val)) {
		digitalWrite(this.pin, val);
	} else {
		analogWrite(this.pin, val);
	}
	cb.call(this, null, val);
}

module.exports = function(pin, direction) {
	this.pin = pin;
	this.direction = direction;
	this.read = read;
	this.write = write;
	return this;
};