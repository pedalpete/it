var sensorLib = require('node-dht-sensor');

var sensor = {
	initialize: function(cmp) {
		return sensorLib.initialize(cmp.chipid, cmp.address);
	},
	read: function() {
		var readout = sensorLib.read();
		return {
			'temperature': readout.temperature.toFixed(1),
			'humidity': readout.humidity.toFixed(1)
		};
	}
};

function getSensor(component) {
	if (sensor.initialize(component)) {
		return sensor.read();
	} else {
		console.warn('Failed to initialize sensor');
	}
}

module.exports = getSensor;
