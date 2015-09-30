var $$ = require('../index.js')();

var led = $$('led').set(0);
var ledGet = $$('led').get();
// attach an event to the button click
$$('button').onChange(changeLights);

function changeLights() {
ledGet = $$('led').get()[0];
	if (ledGet.blue === 0 && ledGet.green === 0) return led.set(1, 'blue');
	if (ledGet.blue===1 && ledGet.green === 0) {
		led.set(0,'blue');
		return led.set(1,'green');
	}
	if (ledGet.blue === 0 && ledGet.green === 1) return led.set(1,'blue');
	if (ledGet.blue === 1 && ledGet.green === 1) return led.set(0);
}