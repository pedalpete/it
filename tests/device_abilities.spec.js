var $$ =  require('../lib/favor_obj_builder.js')('./tests/mock_favorit.json');

describe("components", function(){
    it("should find a matching single component", function(){
        var led = $$('led');
        expect(led[0].address).toBe(1);
        expect(led[1]).toBeUndefined();
    });
    
    it("should match multiple components", function(){
        var leds = $$('leds');
        expect(leds.length).toBe(4);
        expect(leds[0].address).toBe(1);
        expect(leds[1].address).toBe(2);
    });
    
    it("should get the correct number of results", function(){
        var leds = $$('leds*3');
        expect(leds.length).toBe(3);
    });
});