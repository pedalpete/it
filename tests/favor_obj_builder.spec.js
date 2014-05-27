var fs = require('fs-extra');
var gpioPath = 'tests/gpio-test/class/gpio';
//setup the filesystem with the exports path
fs.outputFileSync(gpioPath+'/export','none');
for(var i=0;i<=6;i++){
    fs.outputFileSync(gpioPath+i+'/value',2,'utf-8');
    fs.outputFileSync(gpioPath+i+'/direction','none','utf-8');
}

var $$ = require('../lib/favor_obj_builder.js')('./tests/mock_favorit.json');

describe("device build", function(){
   it("should describe the structure of the device", function(){
        expect($$().name).toBe('Test-Device');
        expect($$().get).toBeDefined();   
   });
    
});

describe("get device with query", function(){
    it("should return the query provided", function(){
        expect($$('led').query).toBe('led'); 
    });
});

describe("get device parsed query" , function(){
    it("should show how the query was parsed", function(){
        expect($$('led').parsed_query.type).toBe('led');
        expect($$('led.blue,red').parsed_query.class[0]).toBe('blue');
        expect($$('leds').parsed_query.plural).toBe(true);
        expect($$('led*3').parsed_query.count).toBe(3);
    });
});

describe("add component specfic methods", function(){
    it("should have a test method", function(){
        expect($$('led')[0].get()).toBeDefined();
    });
});