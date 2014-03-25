var $$ = require('../lib/favor_obj_builder.js');

describe("device build", function(){
   it("should describe the structure of the device", function(){
        var build =$$;
        expect(build.name).toBe('Test-Device');
        expect(build.getTracking).toBeDefined();   
   });
    
    it("should set the state of tracking", function(){
        var build = $$;
        expect(build.getTracking()).toBe(true);
        build.setTracking(false);
        expect(build.getTracking()).toBe(false);
        build.setTracking(true);
        expect(build.getTracking()).toBe(true);
    });
});