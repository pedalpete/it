var $$ =  require('../lib/favor_obj_builder.js')('../tests/mock_favorit');

describe("setters getters", function(){
    it("should initialize and get the values for the led", function(){
        var led = $$('led');
        led.get(function(l){
                expect(l).toBe(false);
        });
            
            

    });
    
    it("should set and then get the value for the led", function(){
        var led = $$('led');
        _fvr[led._component_matches[0]].changed=1;
        led.set(1,function(){
            led.get(function(l){
             expect(l).toBe(true);
            })
        });
        led.set(1, function(){
         //  console.log('changed outside',_fvr[led._component_matches[0]].changed); 
        });
        
        $$('led').set(0);
    });
    
    it("should set the change watcher", function(){
        var button = $$('button');
        button.pressed = function(){
            //this just needs to be called   
        }
        spyOn(button, 'pressed');
        button.onChange(button.pressed);
        expect(_fvr[button._component_matches[0]].initialized).toBeTruthy();
        button.set(1);
        expect(button.pressed).toHaveBeenCalled();
    });   
});

describe('use component defined methods', function(){
    it('led.get should return "defined in component"', function(){
        var val;
        
        runs(function(){
            var led = $$('led.has_get');
            led.get(function(l){
                val=l;
            });
        }); 
        
         waitsFor(function(){
               return val; 
            }, "the value should be false", 5000);

        runs(function(){
        expect(val).toBe("defined in component");
        });
    })
});

describe('use linked components', function(){
    it('should get values from linked component', function(){
        var temp;
        var humid;
        runs(function(){
            $$('temperature').get(function(t){
               temp = t; 
            });
        });
        
        waitsFor(function(){
            return temp;
        },"waiting for temp",4000);
        
        runs(function(){
           expect(temp).toBe('26c'); 
        });
        
        runs(function(){
            $$('humidity').get(function(h){
                humid=h; 
            });
        });
        
        waitsFor(function(){
            return humid;
        }, "waiting for humid", 3000);
       
        runs(function(){
            expect(humid).toBe(80); 
        });
        
    });
});

describe('onChange events', function(){
    it('should be triggered on set events', function(){
    var changed = false;
     
        runs(function(){
             var led = $$('led');
            led.onChange('both',function(){
                return changed = true;
            });
            led.set(1, function(){
               // console.log('passed the change event');
            });
        });
        
        waitsFor(function(){
            return changed; 
        },2000);
        
        runs(function(){
           expect(changed).toBe(true); 
        });
    });
});

describe('post_action', function(){
    it('should run a post_action function before returning on gpio', function(){
         var changed = false;
        var x;
        runs(function(){
            $$('temperature#post_action').get(function(val){
                x = val;   
                changed = true;
            });
        });
        
        waitsFor(function(){
            return changed;
        }, 1000);
            
        runs(function(){
            expect(x).toBe('post_format returned'); 
        });
    });
    it('should run a post_action function before returning on i2c', function(){
        var changed = false;
        var x;
        runs(function(){
            $$('accelerometer#post_action').get(function(val){
                x = val;   
                changed = true;
            });
        });
        
        waitsFor(function(){
            return changed;
        }, 1000);
            
        runs(function(){
            expect(x).toBe('post_format returned'); 
        });
    });
});

describe('working with i2c', function(){
    it('should get i2c', function(){
        
        var acc, mocki2c,
            start = new Date();
        runs(function(){
            var accel = $$('accelerometer').get(function(f){
                mocki2c = f.counts;
                acc = f.inputs;
            });
        });
        
        waitsFor(function(){
            return acc;
        },3000)
         
        runs(function(){
            var end = new Date();
            expect(end.valueOf() - start.valueOf()).toBeLessThan(100);
            expect(acc).toBe('51,6');
            expect(mocki2c.writeBytes.length).toBe(3);
            expect(mocki2c.writeBytes[0]).toBe('45,8');
            expect(mocki2c.writeBytes[2]).toBe('44,11');
            expect(mocki2c.readBytes[0]).toBe('51,6');
        });
    });
    
    it('should wait if a wait value is supplied', function(){
         var acc, mocki2c,
            start = new Date();
        runs(function(){
            var accel = $$('accelerometer#test_wait').get(function(f){
                mocki2c = f.counts;
                acc = f.inputs;
            });
        });
        
        waitsFor(function(){
            return acc;
        },3000)
         
        runs(function(){
            var end = new Date();
            expect(end.valueOf() - start.valueOf()).toBeGreaterThan(1000);
            expect(acc).toBe('51,6');
            expect(mocki2c.writeBytes.length).toBe(3);
            expect(mocki2c.readBytes[0]).toBe('51,6');        
        });
    });
    
    it('should use the input value as the bytes value', function(){
        var mocki2c;
        var led = $$('led#blinkm');
        runs(function(){
            led.set([0,0,0],function(f){
               mocki2c = f.counts; 
            });
        });
        
        waitsFor(function(){
            return mocki2c; 
        },1000);
        
        runs(function(){
            expect(mocki2c.writeBytes.length).toBe(1);
            expect(mocki2c.writeBytes[0]).toBe('110,0,0,0');
        });  
    });
    
     it('should take a function as the set value', function(){
        var mocki2c;
        var led = $$('led#blinkm_with_func');
        runs(function(){
            led.set(function(){
                return [1,1,1]},function(f){
               mocki2c = f.counts; 
            });
        });
        
        waitsFor(function(){
            return mocki2c; 
        },1000);
        
        runs(function(){
            expect(mocki2c.writeBytes.length).toBe(1);
            expect(mocki2c.writeBytes[0]).toBe('110,1,1,1');
        });  
    });
    
    it('should get the correct function after initialized', function(){
        var mocki2c;
        runs(function(){
            $$('led#blinkm').set([2,2,2], function(f){
                mocki2c=f.counts;
            });
        });
        
        waitsFor(function(){
           return mocki2c;
        },1000);
        
        runs(function(){
            expect(mocki2c.writeBytes.length).toBe(2);
            expect(mocki2c.writeBytes[1]).toBe('110,2,2,2');
        });
    });
    
    it('should error if get or set is not defined', function(){
       var mocki2c;
        var led = $$('led#blinkm');
        spyOn(led, 'onError');
        runs(function(){
           led.get(function(f){
                mocki2c=f;
            });
        });
        
        waitsFor(function(){
            return mocki2c;
        },1000);
        
        runs(function(){
           expect(led.onError).toHaveBeenCalled(); 
            expect(mocki2c.err).toBeDefined();
        });
            
    });
    
});