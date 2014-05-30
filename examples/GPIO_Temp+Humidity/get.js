var sensorLib = require('../../node_modules/build/Release/node-dht-sensor');

var sensor = {
  initialize: function(cmp) {
    return sensorLib.initialize(cmp.chip_id, cmp.address);
  },

  read: function() {
    var readout = sensorLib.read();
    if (readout.humidity != 0 && readout.temperature != 0)
      return {'temperature': readout.temperature.toFixed(1), 'humidity': readout.humidity.toFixed(1)};
      console.log('error getting tmperature or humidity');
  }
};



function getSensor(component){
    if(sensor.initialize(component)){
        return sensor.read();   
    } else {
      console.warn('Failed to initialize sensor');   
    }
}

module.exports = getSensor;
