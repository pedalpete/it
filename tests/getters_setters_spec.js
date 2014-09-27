var $$ =  require('../lib/favor_obj_builder.js')('./tests/mock_favorit.json');

describe("setters getters", function(){
    it("should get and set the values for the led", function(){
        var led = $$('led');
        spyOn(led, "onError");
        var get_led = led.get();
        console.log(get_led);
        led.set('low');
        expect(led.get()).toBe(false);
        led.set('high');
        expect(led.get()).toBe(true);
        led.set(0);
        expect(led.get()).toBe(false);
        led.set(true);
        expect(led.get()).toBe(true);
        var rgb = $$('led#rgb');
        rgb.set(1).set(2).set(3).set(4);
        var get_rgb = rgb.get();
        expect(get_rgb[0].red).toBe(4);
        expect(get_rgb[0].green).toBe(4);
        rgb.set(0);
        setTimeout(function(){
            //needs a bit of time to reset all the pins
            get_rbg = rgb.get();
            expect(get_rgb[0].red).toBe(0);
            expect(get_rgb[0].green).toBe(0);
            rgb.set(1,'red');
            expect(get_rgb[0].red).toBe(1);
            expect(get_rbg[0].green).toBe(0);
        },30);

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
        expect($$('leds').get()[2]).toBe("defined in component");
    })
})

describe('use linked components', function(){
    it('should get values from linked component', function(){
        expect($$('temperature').get()[0]).toBe('26c');
        expect($$('humidity').get()[0]).toBe(80);
        expect($$('temperature.outside').get()[0]).toBe('26c');
    });
        
describe('onChange events', function(){
    it('should be triggered on set events', function(){
        var led =  $$('led').set(0);
        spyOn(led[0].gpio, "on");
        led.onChange(function(){
        });
        led.set(1);
        expect(led[0].gpio.on).toHaveBeenCalled();
    });
});
});

describe('working with i2c', function(){
    it('should get i2c', function(){
        var accel = $$('accelerometer');
    });
});