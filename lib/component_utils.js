var async = require('async');

exports.getComponent = function() {
	if (this._parent) {
		var keyFromIndex = Object.keys(_fvr[this._parent].structure)[this._index];
		return _fvr[this._parent].structure[keyFromIndex];
	}
	return _fvr[this._index];
};

function emitEvents(data) {
	var fvr = this;
	if (!fvr._component._eventEmitter) return; //no event emitter attached
	Object.keys(fvr._component._eventEmitter._events)
	.filter(function(e) {
		if (e !== 'initialized') return e;
	}).forEach(function(e) {
		fvr._component._eventEmitter.emit.call(fvr, e, data);
	});
};

exports.emitEvents = emitEvents;

function getMethod() {
	return this._watch ? this._watch.change : this._method.name || this._method;
};
exports.getMethod = getMethod;

function returnCallback(val) {
	var fvr = this;
	if (_fvr[fvr._index].formatOutput && val) {
		val = _fvr[fvr._index].formatOutput.call(fvr, val);
	}
	emitEvents.call(fvr, val);
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
};

function runMethod(protocolFunc, withInit) {
	var fvr = this;

	var returnObj = {
		val: [],
		err: []
	};
	var action = getMethod.call(fvr);
	function appendCallbackVal(err, val) {
		returnObj.err.push(err);
		returnObj.val.push(val);
	}
	if (withInit) {
		var methodSeries = convertToArray(fvr._component.init)
			.concat(convertToArray(fvr._component[action]));
	} else {
		var methodSeries = convertToArray(fvr._component[action]);
	}

	var arrayFuncs = methodSeries.map(function(cmd, idx) {
		cmd.address = fvr._component.address;
		cmd.val = getValueToSet.call(fvr, cmd);
		cmd._componentIndex = fvr._index;
		cmd.cb = appendCallbackVal.bind(fvr);
		return function(cb) {
			protocolFunc(cmd, cb);
			if (withInit && idx ===
				convertToArray(_fvr[fvr._index].init).length - 1) {
				_fvr[fvr._index].initialized = true;
			}
		};
	});
	async.series(arrayFuncs , function(err, val) {
		if (fvr._method.name === 'set') val = fvr._valueToSet;
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