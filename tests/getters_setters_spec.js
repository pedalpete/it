var $$ =  require('../lib/favor_obj_builder.js')('./tests/mock_favorit.json');

describe("setters getters", function(){
    it("should initialize and get the values for the led", function(){
        var led = $$('led');
        var val;
        runs(function(){
           led.get(function(l){
                val=l;
            });
            
        });
            waitsFor(function(){
               return val; 
            }, "the value should be false", 5000);

            runs(function(){
            expect(val[0]).toBe(false);
            });

    });
    
    it("should set and then get the value for the led", function(){
        var led = $$('led');
        var val;
        
        runs(function(){
            led.set(1,function(){
                led.get(function(l){
                    val = l;
                })
            })
        });
        
        waitsFor(function(){
            return val; 
        }, "the value has been updated and should be true", 5000);
        
        runs(function(){
           expect(val[0]).toBe(true); 
        });
        
    });
    
    it("should set the change watcher", function(){
        var button = $$('button');
        button.set(0);
        /* need to fix the onChange test when remove change event won't
        cause the test to run continiously
        button.onChange(function(){ console.log(val)});
        expect(button[0].initialized).toBeTruthy();
        return;
        */
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
        expect(val[0]).toBe("defined in component");
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
           expect(temp[0]).toBe('26c'); 
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
            expect(humid[0]).toBe(80); 
        });
        //expect($$('temperature.outside').get()[0]).toBe('26c');
        
    });
        
describe('onChange events', function(){
    it('should be triggered on set events', function(){
       $$('led').set(0).set(1);
        console.log(led);
        spyOn(led[0].gpio, "on");
        led.onChange(function(){
        });
        led.set(1);
        expect(led[0].gpio.on).toHaveBeenCalled();
    });
});
});

/*describe('working with i2c', function(){
    it('should get i2c', function(){
        var accel = $$('accelerometer');
    });
});*/