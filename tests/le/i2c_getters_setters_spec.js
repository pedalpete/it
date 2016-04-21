require('./mocks/i2c');
var favoritjs = require('./mocks/favorit');
var $$ =  require('../../index.js')(favoritjs);

describe('initialize i2c', function() {
	it('should create the global i2c object', function() {
		var temp = $$('accelerometer.i2c');
		var check;

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