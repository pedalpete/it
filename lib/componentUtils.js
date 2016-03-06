exports.getComponent = function() {
	if (this._parent) {
		var keyFromIndex = Object.keys(_fvr[this._parent].structure)[this._index];
		return _fvr[this._parent].structure[keyFromIndex];
	}
	return _fvr[this._index];
};

exports.emitEvents = function(data) {
	var fvr = this;
	if (!fvr._component._eventEmitter) return; //no event emitter attached
	Object.keys(fvr._component._eventEmitter._events)
	.filter(function(e) {
		if (e !== 'initialized') return e;
	}).forEach(function(e) {
		fvr._component._eventEmitter.emit.call(fvr, e, data);
	});
};

exports.getMethod = function() {
	return this._watch ? this._watch.change : this._method.name || this._method;
};

exports.selectCallback = function(method, idx, runMethod, returnCallback) {
	var fvr = this;
	var cmd = _fvr[fvr._index][method];
	if (method === 'init') {
		if (!Array.isArray(cmd) || idx === cmd.length - 1) {
			_fvr[this._index].initialized = true;
			return function(err, val) {
				return runMethod.call(fvr);
			};
		}
		return function(err, val) { return; };
	}
	if (!Array.isArray(cmd) || idx === cmd.length - 1) return returnCallback;
};

exports.getValueToSet = function(cmd) {
	if (cmd.formatInput) {
		return cmd.formatInput.call(this, this._valueToSet);
	}
	if (cmd.val) return cmd.val === true ? this._valueToSet : cmd.val;
	return 0;
};