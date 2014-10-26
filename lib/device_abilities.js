var device,
    parseObject = function(el){
    device = this;
    return new Parsed_Object(el);   
};
function Parsed_Object(el){
    return this.init(el);
}

Parsed_Object.prototype = {
    init: function(el){
        this.el = el;
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
        var classes= el.match(/\.([\w,-_]+)/);
        if(classes){
            classes = classes[1].split(','); 
        }
        device.query = el;
        device.parsed_query = {
            type: type==='gps' ? 'gps' : type.replace(/s$/,''),
            count: !count ? null : parseFloat(count[1]),
            plural: /s$/.test(type) || count,
            name:   name ? name[1] : null,
            class: classes
        };
        return device.parsed_query;
    },
    isPlural: function(el){
        //just check if the last letter in the string is s and not looking for gps
        return el.slice(-1)==='s' && el !== 'gps';   
    },
    propertyMatch: function(el_prop, component_prop){
        //if we're not searching on el_prop, just return true
        //if we are searching on el_prop, it must match component_prop
        if(el_prop === null || el_prop===component_prop) return true
        return false;
    },
    checkClass: function(classes,component){
        for(var key in component){
          if(key!=='structure' && classes.indexOf(component[key])>=0){
            return true;   
          }
          
        }
        if(component.structure){
            
            var structure_array = Object.keys(component.structure);
            var has_class = structure_array.filter(function(struct){
               
                return classes.indexOf(struct)>=0;
            });
           
            return has_class.length>0;
        }
        return false;
    },
    filterComponents: function(el_obj){
        //find the matching components
        var matches = [];
        for(var i=0; i<device.components.length;i++){
            var component = device.components[i];
            var isTrue=true;
            var skip_check=['count','plural','class'];
            for(var key in el_obj){
                if(skip_check.indexOf(key)==-1 && isTrue){
                        isTrue = this.propertyMatch(el_obj[key], component[key]);
                    }
                //if key is class, check attributes and structure
                if(key==='class' && el_obj.class!==null){
                    isTrue = this.checkClass(el_obj.class,component);   
                }
            
            }
            if(isTrue) matches.push(i);
            if(!el_obj.plural && matches.length===1 || el_obj.count === matches.length){
                device._component_matches = matches;
                return device;
            }
            
        }
        
        device._component_matches = matches;
        return device;
    }
}

module.exports.device_abilities = parseObject;