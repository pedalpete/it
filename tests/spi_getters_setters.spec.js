var favoritjs = require('./mocks/favorit');
var $$ =  require('../index.js')(favoritjs);

describe('spi', function() {
	it('should initialize a new spi', function() {
		var getSpi = false;
		var device;
		runs(function() {
			$$('temperature#spi').get(function(data) {
				device = this;
				getSpi = data;
			});
		});

		waitsFor(function() {
			return getSpi;
		},1000);

		runs(function() {
			expect(getSpi.length).toBe(6);
			expect(_fvr[device._index].initialized).toBeTruthy();
		});
	});

	it('should transfer without initializing again', function() {
		var getSpi = false;
		var device;
		runs(function() {
			$$('temperature#spi').get(function(data) {
				device = this;
				getSpi = data;
			});
		});

		waitsFor(function() {
			return getSpi;
		},1000);

		runs(function() {
			expect(getSpi.length).toBe(6);
			expect(_fvr[device._index]._spi.transferred).toBe(2);
		});
	});

	// Watch events not cancelling
	// it('should watch an spi', function() {
	// 	var reqs = 0;
	// 	var device;
	// 	var getSpi = false;
	// 	function getData(data) {
	// 		reqs++;
	// 		if (reqs === 5) {
	// 			device = this;
	// 			getSpi = data;
	// 		}
	// 	}

	// 	runs(function() {
	// 		$$('temperature#spi').on('change', getData);
	// 	});

	// 	waitsFor(function() {
	// 		return getSpi;
	// 		$$('temperature#spi').removeListener('change', getData);
	// 	},1000);

	// 	runs(function() {
	// 		expect(device._component._spi.transferred).toBeGreaterThan(4);
	// 	});
	// });

	it('should format output', function() {
		var output;

		runs(function() {
			$$('accelerometer#formatOutputSpi').get(function(data) {
				output = data;
			});
		});

		waitsFor(function() {
			return output;
		}, 1000);

		runs(function() {
			expect(output).toBe('postFormat returned');
		});
	});
});