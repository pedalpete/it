var device;
var parseObject = function(el) {
	device = this;
	return new ParsedObject(el);
};

function ParsedObject(el) {
	return this.init(el);
}

ParsedObject.prototype = {
	init: function(el) {
		this.el = el;
		return this.getComponent(el);
	},
	getComponent: function(el) {
		var elObj = this.splitElement(el);
		return this.filterComponents(elObj);
	},
	splitElement: function(el) {
		var type = el.match(/^\w+/)[0]; //get the first match because we adjust later
		var count = el.match(/\*(\d+)/);
		var name = el.match(/#([\w+-_]+)/);
		var classes = el.match(/\.([\w,-_]+)/);
		if (classes) {
			classes = classes[1].split(',');
		}
		device.query = el;
		device.parsedQuery = {
			type: type === 'gps' ? 'gps' : type.replace(/s$/,''),
			count: !count ? null : parseFloat(count[1]),
			plural: /s$/.test(type) || count,
			name:   name ? name[1] : null,
			class: classes
		};
		return device.parsedQuery;
	},
	isPlural: function(el) {
		//just check if the last letter in the string is s and not looking for gps
		return el.slice(-1) === 's' && el !== 'gps';
	},
	propertyMatch: function(elProp, componentProp) {
		//if we're not searching on el_prop, just return true
		//if we are searching on el_prop, it must match component_prop
		if (elProp === null || elProp === componentProp) return true;
		return false;
	},
	checkClass: function(classes, component) {
		for(var key in component) {
			if (key !== 'structure' && classes.indexOf(component[key]) >= 0) {
				return true;
			}
		}
		if (component.structure) {
			var structureArray = Object.keys(component.structure);
			var hasClass = structureArray.filter(function(struct) {
				return classes.indexOf(struct) >= 0;
			});
			return hasClass.length > 0;
		}
		return false;
	},
	filterComponents: function(elObj) {
		//find the matching components
		var matches = [];
		for (var i = 0; i < _fvr.length; i++) {
			var component = _fvr[i];
			var isTrue = true;
			var skipCheck = ['count','plural','class'];
			for (var key in elObj) {
				if (skipCheck.indexOf(key) == -1 && isTrue) {
					isTrue = this.propertyMatch(elObj[key], component[key]);
				}
				//if key is class, check attributes and structure
				if (key === 'class' && elObj.class !== null) {
					isTrue = this.checkClass(elObj.class,component); 
				}
			}
			if (isTrue) matches.push(i);
			if (!elObj.plural && matches.length === 1 ||
			elObj.count === matches.length) {
				device._componentMatches = matches;
				return device;
			}
		}

		device._componentMatches = matches;
		return device;
	}
};

module.exports.deviceAbilities = parseObject;