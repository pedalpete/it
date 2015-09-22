function post_format(val){
 return "post_format returned";   
}

module.exports = {
    name:"Test-Device",
    "gpio-path": "tests/gpio-test/class/gpio",
    i2c_path: "/dev/i2c/-1",
    components : [{type:"led",color:"yellow", address: 1, interface:"gpio"},
                    {type:"led", address: 2, interface:"gpio"},
                    {type:"led", address: 3, name: "has_get", interface: "gpio", methods:[
                    {get:require("../tests/component_methods_mock")}]},
                    {type:"led", name:"rgb", structure:{ red:{
                        address:4},green: {address:5},blue: {address:6} }, interface: "gpio"},
                    {type:"button", name:"light",address:7, interface: "gpio"},
                    {type:"link", name:"rht03",address:8, methods:[
                        {get:require("../tests/mocks/linked_temp_humidity_mock")}], interface: "gpio"},
                    {type:"temperature", name:"link",link:"rht03", returnAs:"temp"},
                    {type:"humidity",link:"rht03",returnAs:"humidity"},
                    {type:"temperature", name:"outside",link:"rht11",returnAs:"temp"},
                    {type:"link",name:"rht11", methods:[
                        {get: require("../tests/mocks/linked_temp_humidity_mock")}],structure:{"temp":{"address":9},humidity:{address:10}}, interface:"gpio"},
                    {type:"accelerometer", name: "bridge", address: 0x11, init: [
                                                                        {cmd:"write",byte: 0x2D, bytes: [1 << 3]},
                                                                        {cmd:"write",byte: 0x31,bytes: [0x09]},
                                                                        {cmd:"write",byte: 0x2c, bytes: [8 + 2 + 1]}
                                                                        ], 
                    get:{cmd:"read", byte:0x33, bytes:6}, interface:"i2c"},
                    {type:"accelerometer", name: "test_wait", address: 0x1d, init:[
                                                                        {cmd:"write",byte: 0x2D, bytes: [1 << 3]},
                                                                        {cmd:"write",byte: 0x31, bytes: [0x09], wait:500},
                                                                        {cmd:"write",byte: 0x2c, bytes: [8 + 2 + 1], wait: 500}], 
                    get:{cmd:"read", byte:0x33, bytes:6}, interface:"i2c"},
                    {type:"accelerometer", name: "init_stream", address: 0x1d, init:[
                                                                        {cmd:"write",byte: 0x2D, bytes: [1 << 3]},
                                                                        {cmd:"write",byte: 0x31, bytes: [0x09], wait:500},
                                                                        {cmd:"write",byte: 0x2c, bytes: [8 + 2 + 1], wait: 500}], 
                    get:{cmd:"read", byte:0x33, bytes:6}, interface:"i2c"},
                    {type:"led", name: "blinkm", address: 0x09, init: {cmd:"write", byte: 0x6d}, set: {cmd:"write", byte:0x6E, bytes: true },interface:"i2c"},
                    {type:"led", address: 0x05, name: "blinkm_with_func", set: {cmd:"write", byte:0x6E, bytes: function(val){
                                                                                            return [1,1,1];
                                                                                            }
                    },interface:"i2c"},
                  {type:"accelerometer", name: "post_action", address: 0x11, init:[
                                                                        {cmd:"write",byte: 0x2D, bytes: [1 << 3]},
                                                                        {cmd:"write",byte: 0x31,bytes: [0x09]},
                                                                        {cmd:"write",byte: 0x2c, bytes: [8 + 2 + 1]}
                                                                        ], 
                    get:{cmd:"read", byte:0x33, bytes:6}, interface:"i2c", post_action: post_format},
                  {type:"temperature", name:"post_action",  address: 9, interface:"gpio", post_action: post_format},
                  {type:"temperature", name:"spi", interface: 'spi', address: '/dev/spidev0.0', mode: 'MODE_0', chipSelect: 'high', get: [ 0x23, 0x48, 0xAF, 0x19, 0x19, 0x19 ]}
                   ]
}