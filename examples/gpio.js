var $$ = require('../index.js')();

var led = $$('led').set(0);
var led_get = $$('led').get();
// attach an event to the button click
$$('button').onChange(function(val){
     led_get = $$('led').get()[0];
	console.log(led_get);
     switch(led_get){
        case (led_get.blue===0 && led_get.green===0):
		console.log('turn blue on');
		return $$('led').set(1,'blue');
        	break;
	case (led_get.blue===1 && led_get.green===0):
		console.log('turn blue off, turn green on');
 		$$('led').set(0,'blue');
		return $$('led').set(1,'green');
		break;
	case (led_get.blue===0 && led_get.green===1):
		console.log('turn on both blue and green');
		return $$('led').set(1,'blue');
		break;
	default:
		console.log('turn off all');
		$$('led').set(0);
     }
     
});