var mockstream = require('mockstream');

function increment(cmd,evt){
    this.counts[cmd].push(evt.toString());
}

function return_obj(cmds){
    return {
        counts: this.counts,
        inputs: cmds.toString()
    };
}

var writeByte =  function(byte,cb){
        increment.call(this,'writeByte', byte);
        cb.call(this, null, return_obj.call(this, byte));
};
var writeBytes = function(command, bytes,cb){
            increment.call(this,'writeBytes',[command, bytes]);
            cb.call(this, null, return_obj.call(this,[command, bytes]));
};
var readByte = function(byte,cb){
            increment.call(this,'readByte', byte);
            cb.call(this, null, return_obj.call(this, byte));
};
var readBytes = function(command, bytes,cb){
            increment.call(this,'readBytes', [command, bytes]);
            
            cb.call(this, null, return_obj.call(this,[command, bytes]));
    };
var on = function(data){
    var res;
    setTimeout(
        function(){
         return res = 'on called with on data';   
        }, 2000);
};
var stream = function(command, length, delay){
    var Stream = new mockstream.MockDataStream({
       chunkSize: length,
       streamLength: length * 10 
    });
    Stream.start();
}

var mock_i2c = function(address, path){
    return {
                    writeByte: writeByte,
                    writeBytes: writeBytes,
                    readByte: readByte,
                    readBytes: readBytes,
                    on: on,
                    stream: stream,
                    counts: {
                        writeByte: [],
                        writeBytes: [],
                        readByte: [],
                        readBytes: []
                    }
    };
};

module.exports =  mock_i2c;


