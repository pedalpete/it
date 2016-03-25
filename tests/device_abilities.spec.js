var favoritjs = require('./mocks/favorit');
var $$ =  require('../index.js')(favoritjs);

describe('components', function() {

	it('should match multiple components', function() {
		var leds = $$('led');
		expect(leds._componentMatches.length).toBe(7);
		expect(_fvr[leds._componentMatches[0]].address).toBe(1);
		expect(_fvr[leds._componentMatches[1]].address).toBe(2);
	});

	it('should get the correct number of results', function() {
		var leds = $$('led*4');
		expect(leds._componentMatches.length).toBe(4);
	});

	it('should get the led by name', function() {
		var led = $$('led#rgb');
		expect(_fvr[led._componentMatches[0]].structure.red.address).toBe(4);
		expect(_fvr[led._componentMatches[0]].structure.green.address).toBe(5);
		expect(_fvr[led._componentMatches[0]].structure.blue.address).toBe(6);
	});

	it('should get the the led based on the color', function() {
		var redLed = $$('led.red,yellow');
		expect(_fvr[redLed._componentMatches[0]].address).toBe(1);
		expect(_fvr[redLed._componentMatches[1]].structure.red.address).toBe(4);
	});

	it('should not return where a class does not match', function() {
		var noMatch = $$('led.none');
		expect(noMatch._componentMatches.length).toBe(0);
	});
	
	it('should search components by attribute', function() {
		var spiLed = $$('led[interface=spi]');
		expect(spiLed._componentMatches.length).toBe(1);
	});
});

describe('linked components', function() {
	it('should return the linked component details', function() {
		var temp =  $$('temperature');
		expect(_fvr[temp._componentMatches[0]].address).toBe(8);
		expect(_fvr[temp._componentMatches[1]].address).toBe(9);
		var humidity = $$('humidity');
		expect(_fvr[humidity._componentMatches[0]].address).toBe(8);
	});
});