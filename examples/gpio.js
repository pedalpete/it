var $$ = require('../index.js')();

var led = $$('led').set(0);
var led_get = $$('led').get();
// attach an event to the button click
$$('button').onChange(function(val){
     led_get = $$('led').get()[0];
	console.log(led_get);
     switch(led_get){
        case {blue:0,green:0}:
		return $$('led').set(1,'blue');
        	break;
	case {blue:1,green:0}:
 		$$('led').set(0,'blue');
		return $$('led').set(1,'green');
		break;
	case {blue:0,green:1}:
		return $$('led').set(1,'blue');
		break;
	default:
		$$('led').set(0);
     }
     
});