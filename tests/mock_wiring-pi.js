var mock_wiring_pi = {
                            setup: function(){},
                            pullUpDnControl: function(){},
                            modes: {OUTPUT:function(){return true;},                                                        INPUT: function(){return true;},
                                    },
                            PUD_DOWN: function(){},
                            pinMode: function(){},
                            digitalWrite: function(address,val){
                                    //mocking out the digitalWrite to set value for testing
                                    return gpio_value=val;
                            },
                            digitalRead: function(){
                                //mocking out digitalRed to get value for testing
                               return gpio_value;
                            }
};

var gpio_value =0;

module.exports = mock_wiring_pi;