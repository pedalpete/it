var $$ =  require('../lib/favor_obj_builder.js')('../tests/mock_favorit');
describe("components", function(){
    it("should find a matching single component", function(){
        var led = $$('led');
        expect(_fvr[led._component_matches[0]].address).toBe(1);
        expect(_fvr[led._component_matches[1]]).toBeUndefined();
    });
    
    it("should match multiple components", function(){
        var leds = $$('leds');
        expect(leds._component_matches.length).toBe(6);
        expect(_fvr[leds._component_matches[0]].address).toBe(1);
        expect(_fvr[leds._component_matches[1]].address).toBe(2);
    });
    
    it("should get the correct number of results", function(){
        var leds = $$('leds*3');
        expect(leds._component_matches.length).toBe(3);
    });
    
    it("should get the led by name", function(){
       var led = $$('led#rgb');
      //  console.log('#rgb', led._component_matches, led.parsed_query, _fvr[3]);
        expect(_fvr[led._component_matches[0]].structure.red.address).toBe(4);
        expect(_fvr[led._component_matches[0]].structure.green.address).toBe(5);
        expect(_fvr[led._component_matches[0]].structure.blue.address).toBe(6);
    });
    
     it("should get the the led based on the color", function(){
        var red_led = $$('leds.red,yellow');
        expect(_fvr[red_led._component_matches[0]].address).toBe(1);
        expect(_fvr[red_led._component_matches[1]].structure.red.address).toBe(4);
    });
    
    it("should not return where a class does not match", function(){
       var no_match = $$('leds.none');
        expect(no_match._component_matches.length).toBe(0);
    });
});

describe("linked components", function(){
   it('should return the linked component details', function(){
        var temp =  $$('temperatures');
        expect(_fvr[temp._component_matches[0]].address).toBe(8);
        expect(_fvr[temp._component_matches[1]].address).toBe(9);
        var humidity = $$('humidity');
        expect(_fvr[humidity._component_matches[0]].address).toBe(8);
   });
});