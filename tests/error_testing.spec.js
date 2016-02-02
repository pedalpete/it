var favoritjs = require('./mocks/favorit');
var $$ =  require('../index.js')(favoritjs);

describe('error handling', function() {
	it('should allow the user to change the error handling', function() {
		var led = $$('led*1');
		spyOn(led, 'onError');
		led.set(function() {});
		expect(led.onError).toHaveBeenCalled();
	});
});