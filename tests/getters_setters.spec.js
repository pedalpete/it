var favoritjs = require('./mocks/favorit');
var $$ =  require('../index.js')(favoritjs);

describe('setters getters', function() {
	it('should initialize and get the values for the led', function() {
		var led = $$('led*1');
		var check;
		runs(function() {
			led.get(function(val) {
				check = val + 1;
			});
		});

		waitsFor(function() {
			return check;
		}, 1000);
		// doesn't return on 0, so need to add one.
		runs(function() {
			expect(check).toBe(1);
		});
	});

	it('should set the value for the led', function() {
		var led = $$('led*1');
		var check = [];
		runs(function() {
			led.set(1, function(val) {
				check.push(val);
				led.set(0, function(val) {
					check.push(val);
				});
			});
		});

		waitsFor(function() {
			return check.length === 2;
		},1000);

		runs(function() {
			expect(check[0]).toBe(1);
			expect(check[1]).toBe(0);
			check = false;
		});
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
			$$('humidity*1').get(function(h) {
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

		function watchEvt() {
			return changed = true;
		}
		runs(function() {
			var led = $$('led#rgb');
			led.on('change', watchEvt);
			led.set({red: 1, green: 2, blue: 3}, function() {
			});
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
			$$('temperature#formatOutputGpio').get(function(val) {
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

describe('format input', function() {
	it('should pass the set value through a format function', function() {
		var x = {
			'red': null,
			'green': null,
			'blue': null
		};

		runs(function() {
			$$('led#rgb').set({red: 250, green: 40, blue: 8}, function() {
				x[Object.keys(this._component.structure)[this._index]] = this._valueToSet;
			});
		});

		waitsFor(function() {
			return x.blue;
		}, 1000);

		runs(function() {
			expect(x.red).toBe(250);
		});
	});
});