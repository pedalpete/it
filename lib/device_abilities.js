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
        var el_obj = this.splitElement(el);
        return this.filterComponents(el_obj);
    },
    splitElement: function(el){
        var type = el.match(/^\w+/)[0]; //get the first match because we adjust later
        var count = el.match(/\*(\d+)/);
        return {
            type: type==='gps' ? 'gps' : type.replace(/s$/,''),
            count: !count ? null : parseFloat(count[1]),
            plural: /s$/.test(type) || count
      }
    },
    isPlural: function(el){
        //just check if the last letter in the string is s and not looking for gps
        return el.slice(-1)==='s' && el !== 'gps';   
    },
    filterComponents: function(el_obj){
        //find the matching components
        var matches = device.components.filter(function(component){
            return component.type===el_obj.type;
        });
        
        if(!el_obj.plural) return matches[0]; // not plural, return only first
        if(el_obj.count === null) return matches;

        return matches.splice(0,el_obj.count);
    }
}

module.exports = function(device_obj){
    device_obj.prototype.device_abilities = parseObject;
    return device_obj;  
}