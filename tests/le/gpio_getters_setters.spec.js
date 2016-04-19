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
});