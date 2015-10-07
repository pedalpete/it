#Favor-it
## A simple library for interacting with IoT devices.

Favor-it is a javascript/node.js library to abstract away complex and inconsistent hardware interfaces into a single simple to use API.

## What's supported?
Currently Favor-it has been tested on RaspberryPi v1b and Beaglebone Black, 
but any linux device which runs node should work. I'll be happy to test with other devices,
I just need to get access to them.
 
Favor-it works with GPIO, i2C and SPI protocols (SPI has not been tested on hardware as I'm waiting for some SPI chips.

### How Does It Work?

Favor-it uses a js file (optionally called `favorit.js`) on stored on the device which describes the structure of your hardware.
It queries this js file, similar to how jQuery parses and interacts with the DOM. 
Once Favor-it knows what devices are connected, and how to interact with them, 
you can easly write jQuery style statements like `$$('temperature').get()`
 will get you the temperature on any device running Favor-it which has a temperature sensor. 

### What are the benefits of Favor-it 
1) a consistent api for interacting with different devices and protocols
2) a separation of concerns between hardware and software
3) write-once run-anywhere type code
4) testable logic which will run across different hardware devices

### How do we get started?

First, you'll need to create your favorit.js file. 
This file describes your hardware setup. 


The favorit.js file exports a single object with the following structure:

##### name (string)
This is a name for your device. 
It does not have to be unique, but in the future may be used to identify your device.

##### components (array)
This array holds each of your hardware components, 
for example, thermometers, motors, etc. etc. 

##### component.type (string)
The idea behind a type is that it describes what the 
device does, more than what it is, if possible. 
So for thermometers, I've been using `temperature` as the 
type description, and for humidity, I've been using `humidity`. 
LED's have been `led`, and button is `button`. 

Again, you can use any string you like for now, but
as the project matures, the goal is to settle on a group
of common labels. 

One special type of component is a 'link' component type - see below.

##### link components component.type:'link'
A linked component is a special type of component 
which has multiple value types returned.
 
For example. I had a combined temperature and humidity sensor, but I didn't want to always get both values, and what would I call such a sensor that would be consistent with other devices that only had temperature. 
In code, I want to be able to get humidity without temperature and vice-versa. 
This makes it so that if I run the same logic on a device which only has a temperature sensor, the same logic
will still work.

I created a linked component like this. 

```{"type": "link", "name": "rht11", "structure":{ 
	"temp": {"address": 9}, "humidity": {"address": 10}
	}}```

Then, I described both the temperature and humidity components on their own.
```{"type": "humidity", "link": "rht11", "returnAs": "humidity"},
   {"type":"temperature", "name":"outside", "link": "rht11", "returnAs":"temp"}```
                    
Using this method, we have a consistent way to get temperature from this linked sensor, 
or a temperature only sensor, but using `$$('temperature').get()`

##### component.interface (string) required - valid values gpio | i2c | spi

Describes the hardware interface to the component. 

##### component.address (number | hex) 

This is the address of the component.

Required for gpio | i2c components which do not have a structure defined - see below.

##### component.structure (object)
Some components don't have a single address, or are a compilation of multiple components. 
You can provide a structure that describes the makeup of that component. 

As a simple example, take an RGB LED, the simple 4-prong type. You would not want to always turn on 
each address at the same time, so you can provide a structure. 
For example, an RGB LED may look like this. 
`structure: { "red" : 15,
                "blue" : 16,
                "green": 17
                }` 
where each entry in the structure points to an address.  
               
NOTE: a `structure` component is different from a `link` component where a `link` describes multiple
components on a single chip, a `structure` describes multiple addresses on a single component. They can be used together.

##### component.name (string) required for linked components
This is simply a descriptive name of the component. 
The exception is a component of type `link` where the name is very important because it is used to 'link' the component's
child descriptor back to the parent.

In the `link` example above.
`{"type": "humidity", "link": "rht11", "returnAs": "humidity"}` was linked to `{"type": "link", "name": "rht11", "structure":{ "temp": {"address": 9}, "humidity": {"address": 10}}}` via the `name`.

  

##### component.methods (object)
component methods allows you to specify special methods available to that component. One very important use for this is when you have a component which doesn't respond to the standard 
Favor-it get or set methods. You can provide your own get or set method within this object. 
When calling get or set, Favor-it will check to see if your component has it's own get or set method already defined.

When a component has it's own get or set method, the component is passed into it's own get method so you can retrieve and set any variables on the component itself. 

As your methods will be functions and are therefore not valid json, create your methods as a node.js module, and provide the path to the module as if you were going to require the module. When Favor-it starts-up, it will build it's object and include all your methods via require statements.  

### Running Favor-it

I hope I've made it really simple to get using Favor-it.
Now, include the Favor-it module in your app. 

`var $$ = require('Favor-it')()`
NOTE: you start Favor-it as a function, so don't forget the extra params at the end. If you don't want to have your favorit.js file in the root path of your app, you can define a path within the function call like this
`var $$ = require('Favor-it')(path_to_your_favorit.js)`
You can also set the path to your favorit.js as a environment variable.

### Kinda like jQuery
If you know jQuery (and even if you don't) I hope it won't take you too long to get the hang of using Favor-it.

#### Get one or get many
Favor-it has a very rudamentary pluralizer and the return from a query will return the first result only, unless you pluralize. 
`$$('temperature')` will return only the the first sensor. 
`$$('temperatures')` will return all the temperature sensors on that device.  (no idea why I thought this was important). 

`$$('.green')` will get you anything that has a value of green on any key, and will return all of them. There is no such thing as 'greens'. 



