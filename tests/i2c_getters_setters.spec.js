var favoritjs = require('./mocks/favorit');
var $$ =  require('../index.js')(favoritjs);

describe('working with i2c', function() {

	it('should get i2c', function() {
		var mocki2c = false;
		var start = new Date();
		runs(function() {
			var accel = $$('accelerometer*1').get(function(f) {
				mocki2c = _fvr.i2c.counts;
			});
		});

		waitsFor(function() {
			return mocki2c;
		},3000);

		runs(function() {
			expect(mocki2c.writeI2cBlock.length).toBe(3);
			expect(mocki2c.writeI2cBlock[0]).toBe('1,45,true');
			expect(mocki2c.writeI2cBlock[2]).toBe('1,44,true');
			expect(mocki2c.readI2cBlock[0]).toBe('1,51,true');
			mocki2c.reset();
		});
	});

	it('should run a formatOutput function before returning on i2c', function() {
		var changed = false;
		var x;
		runs(function() {
			$$('accelerometer#formatOutputI2c').get(function(val) {
				x = val;
				changed = true;
			});
		});

		waitsFor(function() {
			return changed;
		}, 1000);

		runs(function() {
			expect(x).toBe('postFormat returned');
		});
	});

	it('should use the input value as the bytes value', function() {
		var mocki2c;
		var led = $$('led#blinkm');
		runs(function() {
			led.set([0,0,0],function(f) {
				mocki2c = _fvr.i2c.counts;
			});
		});

		waitsFor(function() {
			return mocki2c;
		},1000);

		runs(function() {
			expect(mocki2c.writeI2cBlock.length).toBe(5); //gets initialized first
			expect(mocki2c.writeI2cBlock[3]).toBe('9,109,true');
			expect(mocki2c.writeI2cBlock[4]).toBe('9,110,true');
			mocki2c.reset();
		});
	});

	it('should take a function as the set value', function() {
		var mocki2c;
		var val;
		var led = $$('led#blinkm_with_func');
		runs(function() {
			led.set({r: 1, g: 2, b: 3},
				function(f) {
				val = f;
				mocki2c = _fvr.i2c.counts;
			});
		});

		waitsFor(function() {
			return mocki2c;
		},1000);

		runs(function() {
			expect(val.g).toBe(2);
			expect(mocki2c.writeI2cBlock.length).toBe(1);
			expect(mocki2c.writeI2cBlock[0]).toBe('5,110,true');
			mocki2c.reset();
		});
	});

	it('should get the correct function after initialized', function() {
		var mocki2c;
		var val;
		runs(function() {
			$$('led#blinkm').set([2,2,2], function(f) {
				val = f;
				mocki2c = _fvr.i2c.counts;
			});
		});

		waitsFor(function() {
			return mocki2c;
		},1000);

		runs(function() {
			expect(mocki2c.writeI2cBlock.length).toBe(1);
			expect(mocki2c.writeI2cBlock[0]).toBe('9,110,true');
			mocki2c.reset();
		});
	});

	it('should get linked i2c', function() {
		var mocki2c;
		var val;
		var temp = $$('temp.i2cLink');

		runs(function() {
			temp.get(function(data) {
				mocki2c = _fvr.i2c.counts;
				val = data;
			});
		});

		waitsFor(function() {
			return val;
		}, 1000);

		runs(function() {
			expect(val).toBe(80);
		});
	});

	// it('should error if get or set is not defined', function() {
	// 	var mocki2c;
	// 	var led = $$('led#blinkm');
	// 	spyOn(led, 'onError');
	// 	runs(function() {
	// 		led.get(function(f) {
	// 			mocki2c = _fvr.i2c;
	// 		});
	// 	});

	// 	waitsFor(function() {
	// 		return mocki2c;
	// 	},1000);

	// 	runs(function() {
	// 		expect(led.onError).toHaveBeenCalled();
	// 		expect(mocki2c.err).toBeDefined();
	// 	});
	// });

	it('should initialize and watch i2c', function() {
		var watchEvents = [];
		var done = false;
		var removedEvt = false;
		function watch(data) {
			watchEvents.push(data);
			if (watchEvents.length === 5) {
				$$('accelerometer#init_stream').removeWatch(watch);
			}
		}

		runs(function() {
			$$('accelerometer#init_stream').watch(watch);
		});

		waitsFor(function() {
			return watchEvents.length = 5;
		},3000);

		runs(function() {
			expect(watchEvents.length).toBe(5);
		});
	});
});
