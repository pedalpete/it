var $$ =  require('../lib/favor_obj_builder.js')('../tests/mocks/favorit');

describe('setters getters', function() {
	it('should initialize and get the values for the led', function() {
		var led = $$('led');
		led.get(function(l) {
			expect(l).toBe(false);
		});
	});

	it('should set and then get the value for the led', function() {
		var led = $$('led');
		_fvr[led._componentMatches[0]].changed = 1;
		led.set(1,function() {
			led.get(function(l) {
				expect(l).toBe(true);
			});
		});
		led.set(1, function() {});
		$$('led').set(0);
	});

	it('should set the change watcher', function() {
		var button = $$('button');
		var wasPressed = false;
		function pressed() {
			return wasPressed = true;
		}

		button.on('change', pressed);
		expect(_fvr[button._componentMatches[0]].initialized).toBeTruthy();

		runs(function() {
			button.set(1);
			expect(wasPressed).toBeTruthy();
		});

		waitsFor(function() {
			return wasPressed;
		}, 500);

		runs(function() {
			expect(wasPressed).toBeTruthy();
		});
	});
});

describe('use component defined methods', function() {
	it('led.get should return defined in component', function() {
		var val;
		runs(function() {
			var led = $$('led.has_get');
			led.get(function(l) {
				val = l;
			});
		});

		waitsFor(function() {
			return val;
		}, 'the value should be false', 5000);

		runs(function() {
			expect(val).toBe('defined in component');
		});
	});
});

describe('use linked components', function() {
	it('should get values from linked component', function() {
		var temp;
		var humid;

		runs(function() {
			$$('temperature#link').get(function(t) {
				temp = t;
			});
		});

		waitsFor(function() {
			return temp;
		},'waiting for temp',4000);

		runs(function() {
			expect(temp).toBe('26c');
		});

		runs(function() {
			$$('humidity').get(function(h) {
				humid = h;
			});
		});

		waitsFor(function() {
			return humid;
		}, 'waiting for humid', 3000);

		runs(function() {
			expect(humid).toBe(80);
		});
	});
});

describe('on Change events', function() {
	it('should be triggered on set events', function() {
		var changed = false;

		function watch() {
			return changed = true;
		}
		runs(function() {
			var led = $$('led');
			led.on('change', watch);
			led.set(1, watch);
		});

		waitsFor(function() {
			return changed;
		},2000);

		runs(function() {
			expect(changed).toBe(true);
		});
	});
});

/* failing event emitter, needs a fixin'
describe('watch for data on gpio elements', function() {
   it('should trigger the eventEmitter on data updates', function() {
       var watchEvents = [];
       var done = false;

       function testRemove (data) {
            watchEvents.push(data);
            console.log('watch events', watchEvents.length);
            if (watchEvents.length === 4) {
                console.log('before timeout');
                $$('temperature').removeListener('data', testRemove);
                console.log('start timeout');
                setTimeout(function() {
                    done = true;
                }, 1000);
            }
       }

       runs(function() {
          $$('temperature').on('data', testRemove);
       });

       waitsFor(function() {
           return done;
       }, 3000);

       runs(function() {
           console.log('Works');
           expect(watchEvents.length).toBe(4);
       });
   });
});

*/
describe('formatOutput', function() {
	it('should run a formatOutput before returning on gpio', function() {
		var changed = false;
		var x;

		runs(function() {
			$$('temperature#formatOutput').get(function(val) {
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

	it('should run a formatOutput function before returning on i2c', function() {
		var changed = false;
		var x;
		runs(function() {
			$$('accelerometer#formatOutput').get(function(val) {
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
});

describe('working with i2c', function() {
	it('should get i2c', function() {
		var acc = false;
		var mocki2c = false;
		var start = new Date();
		runs(function() {
			var accel = $$('accelerometer').get(function(f) {
				mocki2c = f.counts;
				acc = f.inputs;
			});
		});

		waitsFor(function() {
			return acc;
		},3000);

		runs(function() {
			expect(acc).toBe('51,6');
			expect(mocki2c.writeBytes.length).toBe(3);
			expect(mocki2c.writeBytes[0]).toBe('45,8');
			expect(mocki2c.writeBytes[2]).toBe('44,11');
			expect(mocki2c.readBytes[0]).toBe('51,6');
		});
	});

	it('should wait if a wait value is supplied', function() {
		var acc;
		var mocki2c;
		var start = new Date();
		runs(function() {
			var accel = $$('accelerometer#test_wait').get(function(f) {
				mocki2c = f.counts;
				acc = f.inputs;
			});
		});

		waitsFor(function() {
			return acc;
		},3000);

		runs(function() {
			var end = new Date();
			expect(end.valueOf() - start.valueOf()).toBeGreaterThan(1000);
			expect(acc).toBe('51,6');
			expect(mocki2c.writeBytes.length).toBe(3);
			expect(mocki2c.readBytes[0]).toBe('51,6');
		});
	});

	it('should use the input value as the bytes value', function() {
		var mocki2c;
		var led = $$('led#blinkm');
		runs(function() {
			led.set([0,0,0],function(f) {
				mocki2c = f.counts;
			});
		});

		waitsFor(function() {
			return mocki2c;
		},1000);

		runs(function() {
			expect(mocki2c.writeBytes.length).toBe(1);
			expect(mocki2c.writeBytes[0]).toBe('110,0,0,0');
		});
	});

	it('should take a function as the set value', function() {
		var mocki2c;
		var led = $$('led#blinkm_with_func');
		runs(function() {
			led.set({r: 1, g: 2, b: 3},
				function(f) {
				mocki2c = f.counts;
			});
		});

		waitsFor(function() {
			return mocki2c;
		},1000);

		runs(function() {
			expect(mocki2c.writeBytes.length).toBe(1);
			expect(mocki2c.writeBytes[0]).toBe('110,1,2,3');
		});
	});

	it('should get the correct function after initialized', function() {
		var mocki2c;
		runs(function() {
			$$('led#blinkm').set([2,2,2], function(f) {
				mocki2c = f.counts;
			});
		});

		waitsFor(function() {
			return mocki2c;
		},1000);

		runs(function() {
			expect(mocki2c.writeBytes.length).toBe(2);
			expect(mocki2c.writeBytes[1]).toBe('110,2,2,2');
		});
	});

	it('should error if get or set is not defined', function() {
		var mocki2c;
		var led = $$('led#blinkm');
		spyOn(led, 'onError');
		runs(function() {
			led.get(function(f) {
				mocki2c = f;
			});
		});

		waitsFor(function() {
			return mocki2c;
		},1000);

		runs(function() {
			expect(led.onError).toHaveBeenCalled();
			expect(mocki2c.err).toBeDefined();
		});
	});

	it('should watch i2c', function() {
		var watchEvents = [];
		var done = false;
		var removedEvt = false;
		function watchEvt(data) {
			watchEvents.push(data.counts);
			// removeing watcher is not currently working, this needs to be fixed!
			if (watchEvents.length === 4) {
				$$('accelerometer#test_wait').removeListener('data', watchEvt);
			}
			setTimeout(function() {
				done = true;
			}, 1000);
		}

		runs(function() {
			$$('accelerometer#test_wait').on('data', watchEvt);
		});

		waitsFor(function() {
			return done;
		},3000);

		runs(function() {
			expect(watchEvents.length).toBeGreaterThan(4);
		});
	});

	it('should initialize and watch i2c', function() {
		var watchEvents = [];
		var done = false;
		var removedEvt = false;
		function watch(data) {
			watchEvents.push(data.counts);
			if (watchEvents.length === 5) {
				$$('accelerometer#init_stream').removeListener('data', watch);
			}
			setTimeout(function() {
				done = true;
			}, 1000);
		}

		runs(function() {
			$$('accelerometer#init_stream').on('data', watch);
		});

		waitsFor(function() {
			return done;
		},3000);

		runs(function() {
			expect(watchEvents.length).toBeGreaterThan(5);
		});
	});

});

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
			$$('temperature#spi').on('data', getData);
		});

		waitsFor(function() {
			return getSpi;
		},1000);

		runs(function() {
			expect(_fvr[device._index]._spi.opened).toBeGreaterThan(6);
			expect(_fvr[device._index]._spi.transferred).toBeGreaterThan(6);
			expect(_fvr[device._index]._spi.closed).toBeGreaterThan(6);
		});
	});
});