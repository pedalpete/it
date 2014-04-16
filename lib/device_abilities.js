var parseObject = function(el,device){
    return new Parsed_Object(el,device);   
};
function Parsed_Object(el,device){
    
    return this.init(el,device);
   
}

Parsed_Object.prototype = {
    init: function(el,device){
        this.el = el;
        this.device = device;
        return this.getComponent(el);
    },
    getComponent: function(el){
        var el_obj = this.splitElement(el);
        return this.filterComponents(el_obj);
    },
    splitElement: function(el){
        var type = el.match(/^\w+/)[0]; //get the first match because we adjust later
        var count = el.match(/\*(\d+)/);
        var name = el.match(/#([\w+-_]+)/);
        return {
            type: type==='gps' ? 'gps' : type.replace(/s$/,''),
            count: !count ? null : parseFloat(count[1]),
            plural: /s$/.test(type) || count,
            name: !name ? null : name[1]
      }
    },
    isPlural: function(el){
        //just check if the last letter in the string is s and not looking for gps
        return el.slice(-1)==='s' && el !== 'gps';   
    },
    propertyMatch: function(el_prop, component_prop){
        //if we're not searching on el_prop, just return true
        //if we are searching on el_prop, it must match component_prop
        if(el_prop ===null || el_prop===component_prop) return true
        return false;
    },
    filterComponents: function(el_obj){
        //find the matching components
        var that=this; //filter is going to set this to global
        var matches = this.device.components.filter(function(component){
            var truthy=true;
            for(var key in el_obj){
                if(key!=='count' && key !=='plural' && truthy!==false){
                        truthy = that.propertyMatch(el_obj[key],component[key] || null);
                    }
               }
            return truthy;
        });
        
        if(!el_obj.plural) return [matches[0]]; // not plural, return only first
        if(el_obj.count === null) return matches;

        return matches.splice(0,el_obj.count);
    }
}

module.exports.device_abilities = parseObject;