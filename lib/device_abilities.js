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
            name: !name ? null : name[1],
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
        if(el_prop ===null || el_prop===component_prop) return true
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
        var that=this; //filter is going to set this to global
        var matches = device.components.filter(function(component){
            var truthy=true;
            var skip_check=['count','plural','class'];
            for(var key in el_obj){
                if(skip_check.indexOf(key)<0 && truthy!==false){
                        truthy = that.propertyMatch(el_obj[key],component[key] || null);
                    }
                //if key is class, check attributes and structure
                if(key==='class' && el_obj.class!==null){
                    truthy = that.checkClass(el_obj.class,component);   
                }
            
            }
            
            return truthy;
        });
        
        if(!el_obj.plural) return this.addMatches([matches[0]]); // not plural, return only first
        if(el_obj.count === null) return this.addMatches(matches);

        return this.addMatches(matches.splice(0,el_obj.count));
    },
    addMatches: function(matches){
        //add the matched components to the favorObj
                    for(var i=0; i<matches.length; i++){
                        device[i] = matches[i];   
                    }
                    device.length = matches.length;
        return device;
    }
}

module.exports.device_abilities = parseObject;