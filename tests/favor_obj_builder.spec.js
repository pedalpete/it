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