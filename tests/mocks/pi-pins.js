var thisOnChange;
var testValue = 0;
var mockPiPins = {
	mode: function(dir) {
		this.pin.direction = dir;
		return this.pin;
	},
	value: function(val) {
		if (val === undefined) {
			return this.pin.value || false;
		}
		this.pin.value = val;

		//trigger 'on so we can test it'
		if (thisOnChange) {
			thisOnChange.call();
		}
		return this.pin;
	},
	on: function(dirfn) {
		thisOnChange = fn;
	},
	pin: {}
};

module.exports.connect = function() {
	return mockPiPins;
};