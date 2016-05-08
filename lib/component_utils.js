var async = require('async');

function getComponent() {
	if (this._parent) {
		var keyFromIndex = Object.keys(_fvr[this._parent].structure)[this._index];
		return _fvr[this._parent].structure[keyFromIndex];
	}
	return _fvr[this._index];
};

exports.getComponent = getComponent;

function getMethod() {
	return this._method.name || this._method;
}

exports.getMethod = getMethod;

function returnCallback(val) {
	var fvr = this;
	if (_fvr[fvr._index].formatOutput && val) {
		val = _fvr[fvr._index].formatOutput.call(fvr, val);
	}
	if (fvr._returnAs) return fvr._callback.call(fvr, val[this._returnAs]);
	fvr._callback.call(fvr, val);
}

function convertToArray(input) {
	if (!Array.isArray(input)) return [input];
	return input;
}

function getValueToSet(cmd) {
	if (cmd.formatInput) {
		return cmd.formatInput.call(this, this._valueToSet, cmd);
	}
	if (cmd.val) return cmd.val === true ? this._valueToSet : cmd.val;
	return 0;
}

function runMethod(protocolFunc, withInit) {
	var fvr = this;

	var action = getMethod.call(fvr);
	if (action === 'watch') {
		return setupWatch.call(fvr, protocolFunc);
	}
	var methodSeries = withInit ?
		convertToArray(fvr._component.init)
		.concat(convertToArray(fvr._component[action]))
		:
		convertToArray(fvr._component[action]);

	var arrayFuncs = methodSeries.map(function(cmd, idx) {
		cmd.address = fvr._component.address;
		cmd.val = getValueToSet.call(fvr, cmd);
		cmd._componentIndex = fvr._index;
		return function(cb) {
			protocolFunc(cmd, cb);
			if (withInit && idx ===
				convertToArray(_fvr[fvr._index].init).length - 1) {
				_fvr[fvr._index].initialized = true;
			}
		};
	});
	async.series(arrayFuncs , function(err, val) {
		if (err) return fvr.onError.call(fvr, err);
		if (fvr._method.name === 'set') {
			val = fvr._valueToSet;
			if (_fvr[fvr._index].watchCallbacks) {
				_fvr[fvr._index].watchCallbacks.forEach(function(cb) {
					cb.call(fvr, val);
				});
			}
		}
		returnCallback.call(fvr, val);
	});
}

exports.runMethod = runMethod;

// takes a string and converts it to camelCase from dash-case
exports.convertToCamelCase = function(string) {
	return string.split('-').map(function(u, idx) {
		var firstChar = u[0];
		return firstChar.toUpperCase() + u.replace(firstChar, '');
	}).join().replace(',','');
};

function setupWatch(protocolFunc) {
	var self = this;
	var component = getComponent.call(self);
	//	setup watchCallbacks if it doesnot exist
	if (!_fvr[this._index].watchCallbacks) _fvr[this._index].watchCallbacks = [];
	// if this callback already exists, don't add it again
	if (_fvr[this._index].watchCallbacks.indexOf(this._callback) > -1) return;

	_fvr[this._index].watchCallbacks.push(this._callback);
	// package all the callbaks in this callback
	self._callback = function(val) {
		_fvr[self._index].watchCallbacks.forEach(function(cb) {
			cb.call(self, val);
		});
	};
	// Don't setup interval watching on 'set'
	if (component.set) return;
	_fvr[self._index].interval = setInterval(function() {
		if (component.interface === 'gpio') {
			return component[component.interface].get.call(self);
		}

		if (isFunc.call(self, 'get')) return getFromFunc.call(self);
		self._method = 'get';
		runMethod.call(self, protocolFunc);
	}, self._watchInterval || 100);
}

exports.setupWatch = setupWatch;

function removeWatch() {
	if (_fvr[this._index].watchCallbacks) {
		var idx = _fvr[this._index].watchCallbacks.indexOf(this._callback);
		_fvr[this._index].watchCallbacks.splice(idx, 1);
		if (_fvr[this._index].watchCallbacks.length === 0) {
			clearInterval(_fvr[this._index].interval);
			delete _fvr[this._index].interval;
		}
	}
}

exports.removeWatch = removeWatch;

function getFromFunc() {
	var fvr = this;
	if (!_fvr[this._index].initialized) _fvr[this._index].initialized = true;
	return _fvr[this._index].get.call(fvr,function(val) {
		if (fvr._returnAs) return this._callback.call(fvr, val[fvr._returnAs]);
		this._callback.call(fvr, val);
	});
}

exports.getFromFunc = getFromFunc;

function isFunc(typ) {
	if (this._component.structure) return false; // structures can't have funcs at the mo
	var func = _fvr[this._index][typ];
	return typeof func  === 'function';
}

exports.isFunc = isFunc;