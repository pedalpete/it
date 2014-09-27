var cb = function(vars){
    return 'called with '+ vars
}
var writeByte =  function(byte){
       return 'writeByte called with '+byte;
};
var writeBytes = function(command, bytes){
    return 'writeBytes called with '+command+' ,'+ byte;   
};
var readByte = function(byte){
    return 'readByte called with '+byte;   
};
var readBytes = function(command, bytes){
    return 'readyBytes called with '+command+' ,'+bytes;   
};
var on = function(data){
    var res;
    setTimeout(
        function(){
         return res = 'on called with on data';   
        }, 2000);
};
var stream = function(command, length, delay){
    return 'stream called with '+command+' ,'+length+' ,'+delay;
}

var mock_i2c = {
                    writeByte: writeByte,
                    writeBytes: writeBytes,
                    readByte: readByte,
                    readBytes: readBytes,
                    on: on,
                    stream: stream
};

module.exports.connect = function(){
    return mock_i2c;
};

