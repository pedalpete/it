/* Close a gpio component. Closes only one component at a time
*/
function closeGpio() {
	_fvr[this._index].gpio.unexport();
	_fvr[this._index].initialized = false;
}

/* 	Close i2c closes the entire i2c bus.
	Favor currently only supports a single i2c bus,
	this will need to change to support multiple in the future
*/
function closeI2C() {
	_fvr.i2c.closeSync();
	for (var i = 0; i < _fvr.length; i++) {
		if (_fvr[i].interface === 'i2c') {
			_fvr[i].initialized = false;
		}
	};
}

function close() {
	switch (this._component.interface) {
		case 'gpio':
			closeGpio.call(this);
			break;
		case 'i2c':
			closeI2C.call(this);
		default:
			return;
	}
}

module.exports = close;