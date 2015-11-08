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

describe('format input', function(){
	it('should pass the set value through a format function', function() {
		var x = {
			'red' : null, 
			'green' : null, 
			'blue' : null
		};
		runs(function(){
			$$('led#rgb').set({red:250, green:40, blue:8}, function(){
				
				x[Object.keys(this._component.structure)[this._index]] = this._valueToSet
			});
		});
		
		waitsFor(function() {
			return x.blue;
		}, 1000);
		
		runs(function(){
			expect(x.red).toBe(250);
		});
	});
});