var mock_pi_pins = {
                        mode: function(dir){
                            this.pin.direction = dir;
                            return this.pin;
                        },
                        value: function(val){
                            if(val){
                                //trigger 'on so we can test it'
                                this.on();
                                this.pin.value=val;   
                                return this.pin;
                            }
                            return this.pin.value || false;
                        },
                        on: function(dir,fn){
                        },
                        pin: {}
};

module.exports.connect = function(){
    return mock_pi_pins;
};