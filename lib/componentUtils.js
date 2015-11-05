exports.getComponent = function() {
	if (this._parent) {
		var keyFromIndex = Object.keys(_fvr[this._parent].structure)[this._index];
		return _fvr[this._parent].structure[keyFromIndex];
	}
	return _fvr[this._index];
};
