var $$ = require('favor.it')();

var tri-led = $$('led');
tri-led.set(1);

setInterval(function(){
    setTimeout(function(){
        // gpio should accept false as a valid value for on
        tri-led.set(false);
    }, 1000);

    setTimeout(function(){
        $$('led.green').set(true); 
    },2000);

    setTimeout(function(){
        $$('led.green').set(0);
        // should still work even if you don't use the proper case 'high'
        $$('led.red').set('hiGH');
    },3000);

    setTimeout(function(){
        $$('led.red').set('LOW');
        $$('.blue').set(1);
    },4000);

    setTimeout(function(){
        $$('led').set('high'); 
    },5000);

    setTimeout(function(){
       $$('led').set(0); 
    });
},7000);