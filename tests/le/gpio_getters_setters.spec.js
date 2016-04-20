require('./mocks/gpio');
var favoritjs = require('./mocks/favorit');
var $$ =  require('../../index.js')(favoritjs);

describe('working with gpio', function() {

	it('should set digital gpio', function() {
		var led = $$('led*1');
		var check;
		runs(function() {
			led.set(1, function(val) {
				check = val;
			});
		});

		waitsFor(function() {
			return check;
		}, 1000);

		runs(function() {
			expect(check).toBe(1);
		});
	});

	it('should set the analog gpio', function() {
		var led = $$('led.analog');
		var check;
		global.analogWrite = jasmine.createSpy('analogWrite')
			.andReturn(0.5);

		runs(function() {
			led.set(0.5, function(val) {
				check = val;
			});
		});

		waitsFor(function() {
			return check;
		}, 1000);

		runs(function() {
			expect(check).toBe(0.5);
			expect(analogWrite).toHaveBeenCalled();
		});
	});

	it('should get a digital gpio', function() {
		var temp = $$('temperature');
		var check;

		global.digitalRead = jasmine.createSpy('digitalRead')
			.andReturn(100);
		runs(function() {
			temp.get(function(val) {
				check = val;
			});
		});

		waitsFor(function() {
			return check;
		}, 1000);

		runs(function() {
			expect(check).toBe(100);
		});
	});
});