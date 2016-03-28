module.exports.onError = function(err, line, script) {
	if (_fvr[this._index].onError) {
		return _fvr[this._index].onError.call(this, err, line, script);
	}
	if (_fvr.onError) return _fvr.onError.call(this, err, line, script);
	console.log('The following error curred :' +
	err + ' on line ' + line + ' in script ' + script);
};