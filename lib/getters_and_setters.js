var gpio = require('./protocols/gpio');
var i2c = require('./protocols/i2c');
var spi = require('./protocols/spi');
var EventEmitter = require('events').EventEmitter;
var file = 'getters_and_setters.js';
var componentUtils = require('./component_utils');

function initializeComponent() {
	var fvr = this;
	var protocol = _fvr[this._index].interface || _fvr[this._parent].interface;
	switch (protocol) {
		case 'i2c':
			i2c.call(this);
			break;
		case 'gpio':
			gpio.initialize.call(this);
			if (this._watch) return onData.call(this);
			this._method.call(this);
			break;
		case 'spi':
			spi.call(this);
			break;
	}
}

function isFunc(typ) {
	if (this._component.structure) return false; // structures can't have funcs at the mo
	var func = _fvr[this._index][typ];
	return typeof func  === 'function';
}

function get() {
	var fvr = this;
	if (isFunc.call(this,'get')) return getFromFunc.call(this);
	switch (_fvr[this._index].interface) {
		case 'gpio' :
			gpio.get.call(this);
			break;
		case 'i2c' :
			fvr._method = 'get'; //currently a string would be nice to just have this as the function
			i2c.call(fvr, null);
			break;
		case 'spi' :
			spi.call(fvr);
			break;
	}
}

function getFromFunc() {
	var fvr = this;
	if (!_fvr[this._index].initialized) _fvr[this._index].initialized = true;
	return _fvr[this._index].get.call(fvr,function(val) {
		if (fvr._returnAs) return this._callback.call(fvr, val[fvr._returnAs]);
		this._callback.call(fvr, val);
	});
}

function set(val) {
	if (isFunc.call(this, 'set')) setFromFunc.call(this, val);
	switch (_fvr[this._index].interface) {
		case 'gpio' :
			gpio.set.call(this, val);
			break;
		case 'i2c' :
			i2c.call(this);
			break;
		case 'spi' :
			spi.call(this);
			break;
	}
}

function setFromFunc(val) {
	return _fvr[this._index].set.call(fvr, val, function() {
		this._callback.call(fvr);
	});
}

function passComponentsToSet(x) {
	/*
	gets a list of components to set, checks that address is a structure
 	or a directly addressed component, and then passes to set
	*/
	for (var i = 0; i < this._componentMatches.length; i++) {
		setupFvr.call(this, i);
		if (isFunc.call(this, 'set') && !_fvr[this._index].interface) {
			if (!_fvr[this._index].initialized) _fvr[this._index].initialized = true;
			return setFromFunc.call(this, val);
		}

		if (this._component.structure) {
			this._componentValueToSet = x;
			structuredComponent.call(this);
		} else {
			this._valueToSet = valueToSet.call(this, x);
			if (!_fvr[this._index].initialized) {
				initializeComponent.call(this);
			} else {
				if (typeof this._method !== 'function') {
					console.log('no method', _fvr[this._index], typeof this._method);
				}
				this._method.call(this);
			}
		}
	}
}

function valueToSet(x) {
	var component = componentUtils.getComponent.call(this);
	if (component.formatInput) return component.formatInput.call(this, x);

	if (this._parent && _fvr[this._parent].formatInput) {
		return _fvr[this._parent].formatInput.call(this, x);
	}

	return x;
}

var _set = function(x, cb) {
	this._method = set;
	addCallbackToObject.call(this, cb);
	passComponentsToSet.call(this, x);
};

function getComponentAsObject() {
	//the I/O is not directly addressed, but has an object of addresses.
	var structureKeys = Object.keys(this._component.structure);
	var fvr = this;
	structureKeys.forEach(function(key, idx) {
		fvr._index = idx;
		if (!_fvr[fvr._parent].structure[fvr._index].initialized) {
			return initializeComponent.call(fvr);
		}
		fvr._method.call(fvr);
	});
}

function getLinkIndex() {
	var self = this;
	var linkName = _fvr[self._index].link;
	return _fvr.map(function(f, idx) {
		if (f.name === linkName) return idx;
	}).filter(Number.isInteger)[0];
}

function setupFvr(i) {
	var ci = this._componentMatches[i]; //component index
	var cmp = _fvr[ci];
	this._component = cmp;
	if (cmp.structure) {
		this._parent = ci;
	} else {
		delete this._parent;
		this._index = ci;
	}
	if (cmp.link) {
		var linkIndex = getLinkIndex.call(this);   //getting the index of the linked component
		this._component = _fvr[linkIndex];
		this._index = linkIndex;
		this._returnAs = _fvr[ci].type;
	}
	return this;
}

var _get = function(cb) {
	var fvr = this;
	this._method = get;
	addCallbackToObject.call(this, cb);
	for (var i = 0; i < this._componentMatches.length; i++) {
		setupFvr.call(this, i);
		if (isFunc.call(this, 'get') & !this._component.interface) {
			return getFromFunc.call(this);
		}
		if (this._component.structure) { //not directly addressed, this is a group of  I/Os
			getComponentAsObject.call(this);
		} else {
			if (!_fvr[this._index].initialized) {
				return initializeComponent.call(this);
			}
			return this._method.call(this);
		}
	}
};

function setStreaming() {
	var fvr = this;
	if (fvr._component.interface === 'gpio' || fvr._component.get) {
		fvr._component._streaming = setInterval(function() {
			return	get.call(fvr, function(data) {
				fvr._component._eventEmitter.emit('change', data);
			});
		}, 100);
	}
}

function onData() {
	var fvr = this;

	if (this._component.interface === 'gpio' &&
		this._watch.watcher === 'change') {
		return gpio.attachEvent.call(fvr);
	}
	/*if (this._callback.name.length === 0) {
		return this.onError.call(this,
			'watching stream callbacks must be named functions');
	}*/
	if (!this._component.interface._streaming &&
		this._watch.watcher === 'change' &&
		this._component.interface !== 'gpio') setStreaming.call(this);

	this._component._eventEmitter.on(this._watch.watcher, this._callback);
}

function removeOn() {
	try {
		//_fvr[this._index]._eventEmitter.removeAllListeners();
		_fvr[this._index]._eventEmitter.removeListener(this._watch.watcher,
			this._callback);
	} catch (e) {
		console.log('err', e);
	}
}

var _removeOn = function(watcher, cb) {
	for (var i = 0; i < this._componentMatches.length; i++) {
		setupFvr.call(this,i);
		setupEvents.call(this, watcher, cb);
		addCallbackToObject.call(this, cb);
		if (_fvr[this._index].structure) {
			structuredComponent.call(this, removeOn);
		} else {
			removeOn.call(this);
		}
	}
};

function structuredComponent() {
	var structureArray = Object.keys(this._component.structure);
	var fvr = this;

	structureArray.forEach(function(key, idx) {
		fvr._index = idx;
		var component = componentUtils.getComponent.call(fvr);
		if (fvr._method.name === 'set') {
			fvr._valueToSet = valueToSet.call(fvr, fvr._componentValueToSet);
		}
		if (!component.initialized) {
			return initializeComponent.call(fvr);
		} else {
			return fvr._method.call(fvr);
		}
	});
}

function setupEvents(evt) {
	if (['change', 'data'].indexOf(evt) === -1) {
		return this.onError.call(fvr, 'must pass a valid watch of change or data');
	}

	if (!this._component.direction && this._component.interface === 'gpio') {
		this.direction = 'both';
	}

	var fvr = this;
	this._watch = {
		event: true,
		watcher: evt,
		change: this.direction || fvr._component.get ? 'get' : 'set'
	};
	return;
}

function addOn(evt, cb) {
	var fvr = this;
	fvr._method = addOn;
	for (var i = 0; i < this._componentMatches.length; i++) {
		setupFvr.call(this, i);
		setupEvents.call(this, evt, cb);
		addCallbackToObject.call(this, cb);
		if (this._component.structure) {
			structuredComponent.call(this);
		} else {
			if (!this._component.initialized) {
				return initializeComponent.call(this);
			}
			return onData.call(this);
		}
	}
}

function addCallbackToObject(cb) {
	if (cb) return this._callback = cb;
}

var _on = function(evt, cb) {
	addOn.call(this, evt, cb);
};

module.exports.get = _get;
module.exports.set = _set;
module.exports.on = _on;
module.exports.removeListener = _removeOn;