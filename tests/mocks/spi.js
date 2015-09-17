var MODE = {
    MODE_0: 0, 
    MODE_1: 1,
    MODE_2: 2,
    MODE_3: 3
};

var CS = {
    none: null,
    high: 'HIGH',
    low:  'LOW'
};

var ORDER = {
    msb:  1,
    lsb:  2
};

function isFunction(object) {
    return object && typeof object == 'function';
}

var Spi = function(device, options, callback) {
    

    options = options || {}; // Default to an empty object

    for(var attrname in options) {
	var value = options[attrname];
	
	    this[attrname] = value;
	}

    this.device = device;

    isFunction(callback) && callback(this);
}

Spi.prototype.open = function() {
    if (this.opened) return this.opened++;
    this.opened = 1;
}

Spi.prototype.close = function() {
    if (this.closed) return this.closed++;
    this.closed = 1;
}

Spi.prototype.transfer = function(txbuf, rxbuf, callback) {
    // tx and rx buffers need to be the same size
    this.spiTransfer = {
        write: txbuf.toString('utf-8'), 
        read: rxbuf.toString('utf-8')
    };

    isFunction(callback) && callback(this, rxbuf);
    if (this.transferred) return this.transferred++;
    this.transferred = 1;
    
}

Spi.prototype.mode = function(mode) {
   this.mode = mode
}

Spi.prototype.chipSelect = function(cs) {
    this.chipSelect = cs
}
/*
Spi.prototype.bitsPerWord = function(bpw) {
    if (typeof(bpw) != 'undefined')
	if (bpw > 1) {
            this._spi['bitsPerWord'](bpw);
	    return this._spi;
	}
        else {
	    console.log('Illegal bits per word');
            return -1;
	}
    else
        return this._spi['bitsPerWord']();
}

Spi.prototype.bitOrder = function(bo) {
    if (typeof(bo) != 'undefined')
	if (bo == ORDER['msb'] || bo == ORDER['lsb']) {
            this._spi['bitOrder'](bo);
	    return this._spi;
	}
        else {
	    console.log('Illegal bit order');
            return -1;
	}
    else
        return this._spi['bitOrder']();
}

Spi.prototype.maxSpeed = function(speed) {
    if (typeof(speed) != 'undefined')
	if (speed > 0) {
            this._spi['maxSpeed'](speed);
            return this._spi;
	}
        else {
	    console.log('Speed must be positive');
	    return -1;
	}	    
    else
	return this._spi['maxSpeed']();
}

Spi.prototype.halfDuplex = function(duplex) {
    if (typeof(duplex) != 'undefined')
	if (duplex) {
	    this._spi['halfDuplex'](true);
	    return this._spi;
	}
        else {
	    this._spi['halfDuplex'](false);
            return this._spi;
	}
    else
	return this._spi['halfDuplex']();
}

Spi.prototype.loopback = function(loop) {
    if (typeof(loop) != 'undefined')
	if (loop) {
	    this._spi['loopback'](true);
	    return this._spi;
	}
        else {
	    this._spi['loopback'](false);
	    return this._spi;
	}
    else
	return this._spi['loopback']();
}
*/
module.exports.MODE = MODE;
module.exports.CS = CS;
module.exports.ORDER = ORDER;
module.exports.Spi = Spi;