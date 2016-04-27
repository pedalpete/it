function trackAction(type, addr, val) {
	I2C.counts[type].push([addr, val]);
	
}

global.I2C = {
	setup: function(setupObj){
		//nothing to do here
		return true;
	},
	writeTo: function(addr, reg) {
		trackAction('writeTo', addr, reg);
		return;
	},
	readFrom: function(addr, length) {
		trackAction('readFrom', addr, length);
		return I2C.counts.readFrom.pop();
	},
	counts: {
		writeTo: [],
		readFrom: []
	},
	reset: function() {
		this.counts.writeTo = [];
		this.counts.readFrom = [];
	}
}