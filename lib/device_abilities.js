var parseObject = function(el){
    return new Parsed_Object(el);   
};
function Parsed_Object(el){
    for(var i in this){
    }
    return this.init(el);
   
}

var device = global.favor;

Parsed_Object.prototype = {
    init: function(el){
        
        return this.getComponent(el);
    },
    getComponent: function(el){
        // check if we're dealing with plurals, and then get the correct number of components
        if(this.isPlural(el)===false) return this.filterComponents(el,1);
        el=el.substring(0, el.length - 1);
        return this.filterComponents(el);
    },
    isPlural: function(el){
        //just check if the last letter in the string is s and not looking for gps
        return el.slice(-1)==='s' && el !== 'gps';   
    },
    filterComponents: function(el,count){
        //find the matching components
        var matches = [];
        var els = this.checkAliases(el);
        
        for(var i=0; i<device.components.length; i++){
            if(els.test(device.components[i].type)) {
                 matches.push(device.components[i]);
            }
            // stops incrementing if the correct number of components is in the array
            if(matches.length===count) i= device.components.length;
        }
        // return an array if number of matches > 1
        return matches.length===1 ? matches[0] : matches;
    },
    checkAliases: function(el){
        // checks for component aliases
        var led = ["led","light","tri-color-led"],
            gps = ["location", "gps"];
        var object_of_aliases = {
            "led": led,
            "light": led,
            "tri-color-led": led,
            "gps": gps,
            "location": gps
        }
        
        var el_aliases = object_of_aliases[el] || el;
        return new RegExp( '\\b' + el_aliases.join('\\b|\\b') + '\\b') 
    }
}

module.exports = function(device_obj){
    device_obj.prototype.device_abilities = parseObject;
    return device_obj;  
}