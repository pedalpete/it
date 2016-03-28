var parseObject = function(el) {
	return new ParsedObject(this, el);
};

function ParsedObject(device, el) {
	this.device = device;
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
		var type = el.match(/^\w+/)[0];
		var count = el.match(/\*(\d+)/);
		var name = el.match(/#([\w+-_]+)/);
		var classes = el.match(/\.([\w,-_]+)/);
		var attribute = el.match(/\[(\w+)\=(\w+)\]/);
		if (classes) {
			classes = classes[1].split(',');
		}

		var query = el;
		parsedQuery = {
			type: type,
			count: !count ? null : parseFloat(count[1]),
			name:   name ? name[1] : null,
			class: classes
		};

		if (attribute) parsedQuery[attribute[1]] = attribute[2];
		this.device.parsedQuery = parsedQuery;
		this.device.query = query;
		return parsedQuery;
	},
	propertyMatch: function(elProp, componentProp) {
		//if we're not searching on el_prop, just return true
		//if we are searching on el_prop, it must match component_prop
		if (elProp === null || elProp === componentProp) return true;
		return false;
	},
	checkClass: function(classes, component) {
		for (var key in component) {
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
			var skipCheck = ['count', 'class'];
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
			if (elObj.count === matches.length) {
				this.device._componentMatches = matches;
				return this.device;
			}
		}

		this.device._componentMatches = matches;
		return this.device;
	}
};

module.exports.deviceAbilities = parseObject;