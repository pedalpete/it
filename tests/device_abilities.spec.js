var $$ =  require('../lib/favor_obj_builder.js')('./tests/mock_favorit.json');

describe("components", function(){
    it("should find a matching single component", function(){
        var led = $$('led');
        expect(led.components[led._component_matches[0]].address).toBe(1);
        expect(led.components[led._component_matches[1]]).toBeUndefined();
    });
    
    it("should match multiple components", function(){
        var leds = $$('leds');
        expect(leds._component_matches.length).toBe(4);
        expect(leds.components[leds._component_matches[0]].address).toBe(1);
        expect(leds.components[leds._component_matches[1]].address).toBe(2);
    });
    
    it("should get the correct number of results", function(){
        var leds = $$('leds*3');
        expect(leds._component_matches.length).toBe(3);
    });
    
    it("should get the led by name", function(){
       var led = $$('led#rgb');
      //  console.log('#rgb', led._component_matches, led.parsed_query, led.components[3]);
        expect(led.components[led._component_matches[0]].structure.red.address).toBe(4);
        expect(led.components[led._component_matches[0]].structure.green.address).toBe(5);
        expect(led.components[led._component_matches[0]].structure.blue.address).toBe(6);
    });
    
     it("should get the the led based on the color", function(){
        var red_led = $$('leds.red,yellow');
        expect(red_led.components[red_led._component_matches[0]].address).toBe(1);
        expect(red_led.components[red_led._component_matches[1]].structure.red.address).toBe(4);
    });
    
    it("should not return where a class does not match", function(){
       var no_match = $$('leds.none');
        expect(no_match.components[no_match._component_matches[0]]).toBeUndefined();
    });
});

describe("linked components", function(){
   it('should return the linked component details', function(){
        var temp =  $$('temperatures');
        expect(temp.components[temp._component_matches[0]].address).toBe(8);
        var humidity = $$('humidity');
        expect(humidity.components[humidity._component_matches[0]].address).toBe(8);
   });
});