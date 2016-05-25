var thisOnChange;
function watchChanges() {
	if (this.onChange.length > 0) {
		this.onChange.forEach(function(cbWatch) {
			cbWatch(this.pinValue);
		});
	}
}
function MockPiPins() {
	return {
		onChange: [],
		read: function(cb) {
			watchChanges.call(this);
			cb.call(this, null, this.pin.value || 0);
		},
		write: function(val, cb) {
			this.pin.value = val;

			watchChanges.call(this);
			return cb.call(this, null, this.pin.value);
		},
		watch: function(cb) {
			this.onChange.push(cb);
		},
		unwatch: function(cb) {
			var idx = this.onChange.indexOf(cb);
			this.onChange.splice(idx, 1);
		},
		unexport: function() {
			// what to put in unexport mock?
		},
		pin: {}
	};
};

module.exports = function() {
	return new MockPiPins;
};