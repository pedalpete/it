var mock_pi_pins = {
                        mode: function(dir){
                            this.pin.direction = dir;
                            return this.pin;
                        },
                        value: function(val){
                            if(val){
                                this.pin.value=val;   
                                return this.pin;
                            }
                            return this.pin.value || false;
                        },
                        pin: {}
};


module.exports.connect = function(){
    return mock_pi_pins;
};