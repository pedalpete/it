var $$ =  require('../lib/favor_obj_builder.js')('../tests/mocks/favorit');

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
			expect(_fvr[device._index]._spi.opened).toBe(1);
		});
	});

	it('should open and close device on each request', function() {
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
			expect(_fvr[device._index]._spi.opened).toBe(2);
			expect(_fvr[device._index]._spi.transferred).toBe(2);
			expect(_fvr[device._index]._spi.closed).toBe(2);
		});
	});

	it('should watch an spi', function() {
		var reqs = 0;
		var device;
		var getSpi = false;
		function getData(data) {
			reqs++;
			if (reqs === 5) {
				device = this;
				getSpi = data;
			}
		}

		runs(function() {
			$$('temperature#spi').on('change', getData);
		});

		waitsFor(function() {
			return getSpi;
		},1000);

		runs(function() {
			expect(device._component._spi.opened).toBeGreaterThan(4);
			expect(device._component._spi.transferred).toBeGreaterThan(4);
			expect(device._component._spi.closed).toBeGreaterThan(4);
		});
	});

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