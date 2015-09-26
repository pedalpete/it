'use strict';
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var configFile;
var modules;
var favorJson;
var prototypeModules;
var coreModules = ['../lib/device_abilities.js',
	'../lib/getters_and_setters.js',
	'../lib/error_handling.js'];
var addModules = require('../lib/add_modules.js');

function convertToObject(jsonObj, obj) {
	//this converts our json object into a javascript object with prototype
	Object.keys(jsonObj).forEach(function(key) {
		obj[key] = jsonObj[key];
	});
	return obj;
}

function addMethods(methods, component) {
	// add methods directly on component to override defaults
	methods.forEach(function(method) {
		for (var key in method) {
			component[key] = method[key];
		}
	});
	return component;
};

function setupComponents(favorObj) {
	favorObj.components.forEach(function(component) {
		component._eventEmitter = new EventEmitter();
		if (component.link) {
			//link component to it's linked values from another component
			var linkedComponent =  favorObj.components.filter(function(lnkCmp) {
				return lnkCmp.name === component.link;
			})[0];
			if (linkedComponent) {
				if (linkedComponent.address) {
					component.address = linkedComponent.address;
				}
				if (linkedComponent.structure) {
					var linkStruct = component.returnAs || component.name;
					if (linkedComponent.structure[linkStruct].address) {
						//the structure is directly addressed, so link return the direct address
						component.address = linkedComponent.structure[linkStruct].address;
					} else {
						// the structure has a nested structure or is not directly addressed, so return the nested structure
						component.structure = linkedComponent.structure[linkStruct];
					}
				}
				// check if the linked component has methods, and if so
				if (linkedComponent.methods) {
					addMethods(linkedComponent.methods,component);
				}
			}
		}
		if (component.methods) {
			addMethods(component.methods, component);
		}
	});
	return global._fvr = favorObj.components;
}

function FavorObj() {};

FavorObj.prototype.init = function(passedVar) {
	//search for passed components
	return this.deviceAbilities(passedVar);
};

function buildFavorObj(configFile, modules) {
	try {
		convertToObject(configFile,FavorObj);
		FavorObj.prototype.getTracking = function() {
			return favorJson.tracking || true;
		};
		FavorObj.prototype.getGpioPath = function() {
			return favorJson['gpio-path'] || '/sys/class/gpio/';
		};
	} catch (e) {
		FavorObj = {'error': 'error getting or parsing favor:' + e};
		console.log('error getting or parsing favorit.json:' + e);
	} finally {
		return FavorObj;
	}
}

function favorCore(passedVar) {
	var newFavor = new FavorObj;
	convertToObject(favorJson, newFavor);
	for (var key in prototypeModules) {
		newFavor[key] = prototypeModules[key];
	}
	if (passedVar) {
		return newFavor.init(passedVar);
	}
	return newFavor;
}

module.exports = function(configFile, modules) {
	favorJson = require(configFile || './favorit');
	if (modules) {
		coreModules.push.apply(coreModules, modules);
	}
	prototypeModules = addModules(coreModules);
	setupComponents(favorJson);
	return favorCore;
};