var $$ =  require('../lib/favor_obj_builder.js')('./tests/mock_favorit.json');

describe("setters getters", function(){
    var led = $$('led');
    expect(led.get()).toBe(0);
    led.set(1);
    expect(led.get()).toBe(1);
    led.set('low');
    expect(led.get()).toBe(0);
    led.set('high');
    expect(led.get()).toBe(1);
  
});