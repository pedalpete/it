function postFormat(val) {
	return 'postFormat returned';
}

module.exports = {
	name: 'Test-Device',
	'gpio-path': 'tests/gpio-test/class/gpio',
	components: [
		{type: 'led', color: 'yellow', address: 1, interface: 'gpio'},
		{type: 'led', address: 2, interface: 'gpio'},
		{type: 'led', address: 3, name: 'has_get', interface: 'gpio', methods: [
		{get: require('./component_methods')}]},
		{type: 'led', name: 'rgb', structure: {
			red: {address: 4}, green: {address: 5}, blue: {address: 6}
		}, interface: 'gpio', formatInput: function(x) {
			if (typeof x === 'string') return x;

			return x[Object.keys(this._component.structure)[this._index]];
		}},
		{type: 'button', name: 'light',address: 7, interface: 'gpio'},
		{type: 'link', name: 'rht03',address: 8, methods: [
			{get: require('./linked_temp_humidity_mock')}], interface: 'gpio'},
		{type: 'temperature', name: 'link',link: 'rht03'},
		{type: 'humidity', link: 'rht03'},
		{type: 'temperature', name: 'outside', link: 'rht11'},
		{type: 'link', name: 'rht11', methods: [
			{get: require('./linked_temp_humidity_mock')}],
			structure: {'temperature': {'address': 9}, humidity: {address: 10}},
			interface: 'gpio'},
		{type: 'accelerometer', path: 6, name: 'bridge', address: 1, init: [
			{type: 'write', cmd: 0x2D, val: [1 << 3]},
			{type: 'write', cmd: 0x31, val: [0x09]},
            {type: 'write', cmd: 0x2c, val: [8 + 2 + 1]}
		], get: {type: 'read', cmd: 0x33}, interface: 'i2c'},
		{type: 'accelerometer', path: 5, name: 'test_wait', address: 0x1d, init: [
			{type: 'write', cmd: 0x2D, val: [1 << 3]},
			{type: 'write', cmd: 0x31, val: [0x09], wait: 500},
			{type: 'write', cmd: 0x2c, val: [8 + 2 + 1], wait: 500}],
			get: {type: 'read', cmd: 0x33}, interface: 'i2c'},
		{type: 'accelerometer', path: 4, name: 'init_stream', address: 0x1d, init: [
			{type: 'write',cmd: 0x2D, val: [1 << 3]},
			{type: 'write',cmd: 0x31, val: [0x09], wait: 500},
			{type: 'write',cmd: 0x2c, val: [8 + 2 + 1], wait: 500}],
			get: {type: 'read', cmd: 0x33, val: 6}, interface: 'i2c'},
		{type: 'led', path: 2, name: 'blinkm', address: 0x09,
			init: {type: 'write', cmd: 0x6d},
			set: {type: 'write', cmd: 0x6E, val: [1,2,3]}, interface: 'i2c'},
		{type: 'led', path: 1, address: 0x05, name: 'blinkm_with_func',
			set: {type: 'write', cmd: 0x6E, val: true, formatInput: function(val) {
				return [val.r, val.g, val.b];
			}}, interface: 'i2c'},
		{type: 'accelerometer', name: 'formatOutput', path: 0, address: 0x11, init: [
			{type: 'write', cmd: 0x2D, val: [1 << 3]},
			{type: 'write', cmd: 0x31,val: [0x09]},
			{type: 'write', cmd: 0x2c, val: [8 + 2 + 1]}],
			get: {type: 'read', cmd: 0x33, val: 6}, interface: 'i2c',
				formatOutput: postFormat},
		{type: 'temperature', name: 'formatOutput',  address: 9, interface: 'gpio',
			formatOutput: postFormat},
		{type: 'temperature', name: 'spi', interface: 'spi',
			address: '/dev/spidev0.0',
			mode: 'MODE_0',	chipSelect: 'high',
			get: [0x23, 0x48, 0xAF, 0x19, 0x19, 0x19]},
		{type: 'accelerometer', name: 'formatOutputSpi', address: 'dev/spidev0.1',
		mode: 'MODE_0', chipSelect: 'high', 'get': [0x11, 0xf2],
		formatOutput: postFormat, interface: 'spi'}
	]
};