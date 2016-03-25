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
	if (_fvr[fvr._index].formatOutput) {
		emitEvents.call(fvr,
			_fvr[fvr._index].formatOutput.call(fvr, val));
		return fvr._callback.call(fvr,
			_fvr[fvr._index].formatOutput.call(fvr, val));
	}
	emitEvents.call(fvr, val);
	if (fvr._returnAs) return fvr._callback.call(fvr, val[this._returnAs]);
	fvr._callback.call(fvr, val);
}

function selectCallback(protocolFunc, method, idx, runMethod, returnCallback) {
	var fvr = this;
	var cmd = _fvr[fvr._index][method];
	if (method === 'init') {
		if (!Array.isArray(cmd) || idx === cmd.length - 1) {
			_fvr[this._index].initialized = true;
			return function(err, val) {
				return runMethod.call(fvr, protocolFunc);
			};
		}
		return function(err, val) { return; };
	}
	if (!Array.isArray(cmd) || idx === cmd.length - 1) return returnCallback;
};

exports.selectCallback = selectCallback;

function runMethod(protocolFunc, method) {
	var fvr = this;
	var action = method || getMethod.call(fvr);
	var methodSeries = _fvr[fvr._index][action];
	if (!Array.isArray(methodSeries)) methodSeries = [methodSeries];
	var arrayFuncs = methodSeries.map(function(cmd, idx) {
		var cb = selectCallback.call(fvr, protocolFunc, action, idx, runMethod);
		return function(cb) {
			protocolFunc.call(fvr, cmd, cb);
		};
	});
	async.series(arrayFuncs , function(err, val) {
		if (action === 'init') return runMethod.call(fvr, protocolFunc);
		var cb = selectCallback.call(fvr, protocolFunc, action,
			(_fvr[fvr._index][action].length - 1),
			runMethod, returnCallback);
		cb.call(fvr, val[val.length - 1]);
	});
}

exports.runMethod = runMethod;

exports.getValueToSet = function(cmd) {
	if (cmd.formatInput) {
		return cmd.formatInput.call(this, this._valueToSet, cmd);
	}
	if (cmd.val) return cmd.val === true ? this._valueToSet : cmd.val;
	return 0;
};
