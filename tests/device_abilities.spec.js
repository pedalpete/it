var $$ =  require('../lib/favor_obj_builder.js')('../tests/mocks/favorit');

describe('components', function() {
	it('should find a matching single component', function() {
		var led = $$('led');
		expect(_fvr[led._componentMatches[0]].address).toBe(1);
		expect(_fvr[led._componentMatches[1]]).toBeUndefined();
	});

	it('should match multiple components', function() {
		var leds = $$('leds');
		expect(leds._componentMatches.length).toBe(6);
		expect(_fvr[leds._componentMatches[0]].address).toBe(1);
		expect(_fvr[leds._componentMatches[1]].address).toBe(2);
	});

	it('should get the correct number of results', function() {
		var leds = $$('leds*3');
		expect(leds._componentMatches.length).toBe(3);
	});

	it('should get the led by name', function() {
		var led = $$('led#rgb');
		//  console.log('#rgb', led._componentMatches, led.parsedQuery, _fvr[3]);
		expect(_fvr[led._componentMatches[0]].structure.red.address).toBe(4);
		expect(_fvr[led._componentMatches[0]].structure.green.address).toBe(5);
		expect(_fvr[led._componentMatches[0]].structure.blue.address).toBe(6);
	});

	it('should get the the led based on the color', function() {
		var redLed = $$('leds.red,yellow');
		expect(_fvr[redLed._componentMatches[0]].address).toBe(1);
		expect(_fvr[redLed._componentMatches[1]].structure.red.address).toBe(4);
	});

	it('should not return where a class does not match', function() {
		var noMatch = $$('leds.none');
		expect(noMatch._componentMatches.length).toBe(0);
	});
});

describe('linked components', function() {
	it('should return the linked component details', function() {
		var temp =  $$('temperatures');
		expect(_fvr[temp._componentMatches[0]].address).toBe(8);
		expect(_fvr[temp._componentMatches[1]].address).toBe(9);
		var humidity = $$('humidity');
		expect(_fvr[humidity._componentMatches[0]].address).toBe(8);
	});
});