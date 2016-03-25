var favoritjs = require('./mocks/favorit');
var $$ =  require('../index.js')(favoritjs);

describe('protocol', function(){
	it('should match the component interface', function() {
		var protocols = [];
		var spiCount = _fvr.spi ? _fvr.spi.counts.length : 0;
		spiCount += $$('led[interface=spi]')._componentMatches.filter(function(c) {
			return !_fvr[c].initialized;
		}).length || 0;
		
		var i2cCount = _fvr.i2c ? _fvr.i2c.counts.writeI2cBlock.length : 0;
		i2cCount += $$('led[interface=i2c]')._componentMatches.filter(function(c) {
			return !_fvr[c].initialized;
		}).length || 0;
		
		runs(function() {
			$$('led').set(1, function(val) {
				protocols.push(val);
			})
		});
		
		waitsFor(function() {
			return protocols.length === 9;
		},1000);
		
		runs(function(){
			expect(protocols.length).toBe(9);
			expect(_fvr.spi.counts.length).toBe(spiCount + $$('led[interface=spi]')._componentMatches.length);
			expect(_fvr.i2c.counts.writeI2cBlock.length).toBe(i2cCount + $$('led[interface=i2c]')._componentMatches.length);

		})
		
	})
})