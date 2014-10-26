var $$ =  require('../lib/favor_obj_builder.js')('./tests/mock_favorit.json');

describe("setters getters", function(){
    it("should initialize and get the values for the led", function(){
        var led = $$('led');
        led.get(function(l){
                expect(l).toBe(false);
        });
            
            

    });
    
    it("should set and then get the value for the led", function(){
        var led = $$('led');
        
        led.set(1,function(){
            led.get(function(l){
             expect(l).toBe(true);
            })
        });        
    });
    
    it("should set the change watcher", function(){
        var button = $$('button');
        button.pressed = function(){
            //this just needs to be called   
        }
        spyOn(button, 'pressed');
        button.set(0);
        button.onChange(button.pressed);
        expect(button[0].initialized).toBeTruthy();
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
        
describe('onChange events', function(){
    it('should be triggered on set events', function(){
    var changed = false;
      var led = $$('led');
        led.onChange('both',function(){
            changed = true;
        });
        runs(function(){
            led.set(1, function(){
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
});

describe('working with i2c', function(){
    it('should get i2c', function(){
        var accel = $$('accelerometer');
    });
});