var $$ = require('../lib/device_abilities.js');

describe("components", function(){
    it("should find a matching single component", function(){
        var led = $$('led');
        expect(led.address).toBe(1);
    });
    
    it("should match multiple components", function(){
        var leds = $$('leds');
        expect(leds[0].address).toBe(1);
        expect(leds[1].address).toBe(2);
    });
    
    it("should match equivelant components eg: led = lights, tri-color-led, etc.", function(){
        var leds = $$('leds');
        expect(leds[2].address).toBe(3);
        expect(leds[3].address[0]).toBe(4);
    });
});