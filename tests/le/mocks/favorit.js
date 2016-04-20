module.exports = {
	name: 'LE-test-device',
	components: [
		{type: 'led', color: 'yellow',
		address: 1, direction: 'out', interface: 'gpio'},
		{type: 'led', name: 'analog', analog: true,
		address: 2, direction: 'out', interface: 'gpio'},
		{type: 'temperature', address: 3, direction: 'in',
		interface: 'gpio'}
	]
};