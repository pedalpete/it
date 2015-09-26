var $$ =  require('../index.js')('../tests/mocks/favorit');

describe('setting the device object prototype methods', function() {
	it('should add the get and set methods', function() {
		expect($$().get).toBeDefined();
		expect($$('led').get).toBeDefined();
		expect($$().set).toBeDefined();
		expect($$('led').set).toBeDefined();
	});
});