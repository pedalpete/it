var thisOnChange;
var mockPiPins = {
	onChange: null,
	read: function(cb) {
		cb.call(this, null, this.pin.value || 0);	
	},
	write: function(val, cb) {
		this.pin.value = val;

		//trigger 'on so we can test it'
		if (this.onChange) {
			this.onChange.call(null, this.pin.value);
		}
		return cb.call(this, null, this.pin.value);
	},
	watch: function(cb) {
		this.onChange = cb;
	},
	pin: {}
};

module.exports.connect = function() {
	return mockPiPins;
};