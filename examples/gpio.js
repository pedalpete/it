var $$ = require('../index.js')();

var led = $$('led').set(0);
var led_get = $$('led').get();
// attach an event to the button click
$$('button').onChange(changeLights);

function changeLights(){
led_get = $$('led').get()[0];
	if(led_get.blue===0 && led_get.green===0)return led.set(1,'blue');
	if(led_get.blue===1 && led_get.green===0){
		led.set(0,'blue');
		return led.set(1,'green');
	}
	if(led_get.blue===0 && led_get.green===1) return led.set(1,'blue');
	if(led_get.blue===1 && led_get.green===1) return led.set(0);
}