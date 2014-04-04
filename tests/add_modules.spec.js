var $$ =  require('../lib/favor_obj_builder.js')('./tests/mock_favorit.json');

describe('setting the device object prototype methods', function(){
    it('should add the get and set methods to the prototype of the global device object',function(){
        expect($$().get).toBeDefined();   
        expect($$('led').get).toBeDefined();
    });
});