module.exports = {
	name: 'LE-test-device',
	i2cBus: {
		// i2c pins should not be a string on devices.
		scl: 'A8',
		sda: 'B4'
	},
	components: [
		{type: 'led', color: 'yellow',
		address: 1, direction: 'out', interface: 'gpio'},
		{type: 'led', name: 'analog', analog: true,
		address: 2, direction: 'out', interface: 'gpio'},
		{type: 'temperature', address: 3, direction: 'in',
		interface: 'gpio'},
		{type: 'adxl345', interface: 'i2c',
			address: 0x53, init: [
				{type: 'write', cmd: [0x31,0x09]},
				{type: 'write', cmd: [0x2c]}
			], get: [
				{type: 'write', cmd: [0x32]},
				{type: 'read', length: 6}
			]
		}
	]
};