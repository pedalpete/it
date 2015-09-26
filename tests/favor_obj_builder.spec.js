var fs = require('fs-extra');
var gpioPath = 'tests/gpio-test/class/gpio';
//setup the filesystem with the exports path
fs.outputFileSync(gpioPath + '/export','none');
for (var i = 0 ; i <= 6; i++) {
	fs.outputFileSync(gpioPath + i + '/value', 2,'utf-8');
	fs.outputFileSync(gpioPath + i + '/direction','none','utf-8');
}

var $$ = require('../lib/favor_obj_builder.js')('../tests/mocks/favorit');

describe('device build', function() {
	it('should describe the structure of the device', function() {
		expect($$().name).toBe('Test-Device');
		expect($$().get).toBeDefined();
	});
});

describe('get device with query', function() {
	it('should return the query provided', function() {
		expect($$('led').query).toBe('led');
	});
});

describe('get device parsed query' , function() {
	it('should show how the query was parsed', function() {
		expect($$('led').parsedQuery.type).toBe('led');
		expect($$('led.blue,red').parsedQuery.class[0]).toBe('blue');
		expect($$('leds').parsedQuery.plural).toBe(true);
		expect($$('led*3').parsedQuery.count).toBe(3);
	});
});

describe('add component specfic methods', function() {
	it('should have a test method', function() {
		var leds = $$('leds');
		expect(_fvr[leds._componentMatches[2]].get).toBeDefined();
	});
});

describe('get values from linked component', function() {
	it('should find the component details through the link', function() {
		expect($$('temperature')._componentMatches[0]).toBeGreaterThan(-1);
		expect($$('humidity')._componentMatches[0]).toBeGreaterThan(-1);
	});
});