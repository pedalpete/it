var $$ =  require('../index.js')('../tests/mock_favorit');

describe('setting the device object prototype methods', function(){
    it('should add the get and set methods to the prototype of the global device object',function() {
	    expect($$().get).toBeDefined();   
        expect($$('led').get).toBeDefined();
    });
});