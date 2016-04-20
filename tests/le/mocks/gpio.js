// These are globals provided by Espruino when in a build environment

global.digitalWrite = function(pin, val) {
	if (val > 0 && val < 1) return 0;
	return val;
};

global.analogWrite = function(pin, val) {
	return val;
};

global.digitalRead = function(pin) {
	return Math.floor(Math.random() * 1024) + 1;
};