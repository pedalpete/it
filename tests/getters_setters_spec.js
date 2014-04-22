var $$ =  require('../lib/favor_obj_builder.js')('./tests/mock_favorit.json');

describe("setters getters", function(){
    it("should get and set the values for the led", function(){
        var led = $$('led');
        spyOn(led, "onError");
        var get_led = led.get();
        expect(get_led[0].gpio.value).toBe(0);
        led.set('low');
        expect(led.onError).toHaveBeenCalled();
        led.set('high');
        expect(led.onError).toHaveBeenCalled();

        var rgb = $$('led#rgb');

        var get_rgb = rgb.get();
        expect(get_rgb[0].red.address).toBe(4);
        
        /*   led.set(0).set(1).set(3); //can't run set tests off device ENOENT /sys/class/gpio errors
        expect(led[0].gpio.value).toBe(3);
       */ 
    });
    
    it("should set the change watcher", function(){
        var button = $$('button');
        button.set(0);
        button.onChange(function(val){ console.log(val)});
        expect(button[0].gpio._events).toBeDefined();
    });
    
   
});