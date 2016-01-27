var thisOnChange;
var mockPiPins = {
	read: function(cb) {
		cb.call(this, null, this.pin.value || 0);	
	},
	write: function(val, cb) {
		this.pin.value = val;

		//trigger 'on so we can test it'
		if (thisOnChange) {
			thisOnChange.call();
		}
		return cb.call(this, null, this.pin.value);
	},
	on: function(dir, fn) {
		thisOnChange = fn;
	},
	pin: {}
};

module.exports.connect = function() {
	return mockPiPins;
};