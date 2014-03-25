var fs = require("fs");
var config_file ="./favorit.json";
var favor_obj;
// default tracking to be true
var tracking = true;
try {
    favor_obj = (function(){
        var Favor_Obj = function(json_obj){
            //this converts our json object into a javascript object with prototype
            for(key in json_obj){
                this[key] = json_obj[key];   
            }
            
        }
        
        Favor_Obj.prototype.setTracking = function(set){
            if(typeof set !== 'boolean') return console.log('setTracking must be either true or false');
            tracking = set;   
            return tracking;
        }
        
        Favor_Obj.prototype.getTracking = function(){
            return tracking;   
        }
        
        
        var favor_json= new Favor_Obj(JSON.parse(fs.readFileSync(config_file,'utf8')));
        // for each key in 
        //variable to set if tracking is on or off. on by default
        
       
        // keep the details for the last update
        return favor_json;
    })();
} catch(e) {
    console.log('error getting or parsing favorit.json:'+e);
    return;
}

module.exports = favor_obj