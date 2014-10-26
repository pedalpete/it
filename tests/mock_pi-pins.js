var this_on_change, 
    test_value = 0;
var mock_pi_pins = {
                        mode: function(dir){
                            this.pin.direction = dir;
                            return this.pin;
                        },
                        value: function(val){
                            if(val===undefined){
                               
                                return this.pin.value || false;
                            }
                            this.pin.value=val;
                            
                             //trigger 'on so we can test it'
                                if(this_on_change){
                                    this_on_change.call();
                                }
                    
                            return this.pin;
                        },
                        on: function(dir,fn){
                                this_on_change=fn;
                        },
                        pin: {}
};

module.exports.connect = function(){
    return mock_pi_pins;
};