module.exports = {
	name: 'LE-test-device',
	components: [
		{type: 'led', color: 'yellow',
		address: 1, direction: 'out', interface: 'gpio'}
	]
};