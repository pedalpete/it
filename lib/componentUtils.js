exports.getComponent = function() {
	if (this._parent) {
		var keyFromIndex = Object.keys(_fvr[this._parent].structure)[this._index];
		return _fvr[this._parent].structure[keyFromIndex];
	}
	return _fvr[this._index];
};

exports.emitEvents = function(data) {
	var fvr = this;
	Object.keys(fvr._component._eventEmitter._events)
	.filter(function(e) {
		if (e !== 'initialized') return e;
	}).forEach(function(e) {
		fvr._component._eventEmitter.emit.call(fvr, e, data);
	});
};