var $$ = require('../lib/favor_obj_builder.js')('../tests/mock_favorit');

describe('error handling', function(){
    it('should allow the user to change the error handling', function(){
        var led = $$('led');
        spyOn(led, "onError");
        led.set(function(){});
        expect(led.onError).toHaveBeenCalled();
    });
});