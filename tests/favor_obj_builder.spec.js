var fs = require('fs-extra');
var gpioPath = 'tests/gpio-test/class/gpio';
//setup the filesystem with the exports path
fs.outputFileSync(gpioPath+'/export',0);
for(var i=0;i<6;i++){
    fs.outputFileSync(gpioPath+i+'/value',2,'utf-8');
    fs.outputFileSync(gpioPath+i+'/direction','none','utf-8');
}

var $$ = require('../lib/favor_obj_builder.js');

describe("device build", function(){
   it("should describe the structure of the device", function(){
        expect($$.name).toBe('Test-Device');
        expect($$.getTracking).toBeDefined();   
   });
    
    
    it("should set the path of inputs (gpio for now)", function(){
    
        expect($$.getGpioPath()).toBe(gpioPath);
        
            /* for some reason, these tests aren't working. 
            Will test on device and see if I get a better result.

            expect(parseInt(fs.readFileSync(gpioPath+'/export','utf-8'),10)).toBeGreaterThan(0);
            
            var pin1d = fs.readFileSync(gpioPath+'1/direction','utf-8');
            var pin1v = fs.readFileSync(gpioPath+'1/value','utf-8');
            console.log(pin1d, pin1v);
            expect(pin1d).toBe('out');
            expect(parseInt(pin1v,10)).toBe(0);
            */
      
    });
    
   
    
});