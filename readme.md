#favorit
## A simple library for interacting with IoT devices.

favorit is a javascript/node.js library to abstract away complex and inconsistent hardware interfaces into a single simple to use API.

## In a nutshell

Have you ever wanted to write 

`$$('temperature').get(function(temp) { console.log('The temperature is ', temp) };`

Well, now you can, and run on multiple devices without mixing business logic with device configuration considerations.

### Supported Versions of node
Favorit has been tested with node v4, it should also work with v5. v0.10 and v0.12 have not been tested and may not work. 

## What's supported?
Currently favorit has been tested on RaspberryPi v1b and Beaglebone Black, 
but any linux device which runs node.js should work. I'll be happy to test with other devices,
I just need to get access to them.
 
favorit works with GPIO, i2C and SPI protocols.

### How Does It Work?

favorit uses a js file (optionally called `favorit.js`) stored on the device which describes the structure of your hardware.
It queries this js file, similar to how jQuery parses and interacts with the DOM. 
Once favorit knows what devices are connected, and how to interact with them, 
you can easly write jQuery style statements like `$$('temperature').get(callback)`
 will get you the temperature on any device running favorit which has a temperature sensor. 

### What are the benefits of favorit 
1) a single consistent api for interacting with different devices and protocols

2) a separation of concerns between hardware and software

3) write-once run-anywhere 

4) testable logic which will run across different hardware devices

### Installing

`npm install favor-it`

#### errors installing on windows
Some included packages do not build on windows. I'll be improving the install process to get around this.
At the moment, ignore the build errors, you should be able to develop on your local machine fine and push
your changes to devices.

### How do we get started?

First, you'll need to create your favorit.js file. 
This file describes your hardware setup. 


The favorit.js file exports a single object with the following structure:
#### name (string)
This is a name for your device. 
It does not have to be unique, but in the future may be used to identify your device.

#### components (array)
This array holds each of your hardware components, 
for example, thermometers, motors, etc. etc. 

Each of the following items documented as `component.` is a object in the components array.

#### component.type (string)
This describes the function of the component. This can be any string you like, 
but as the project matures the goal is to settle on a group of common labels.

Examples of component type are 'led', 'temperature', 'humidity', 'accelerometer', etc.

One special type of component is a 'link' component type - see below.

#### link components component.type:'link'
A linked component is a special type of component which has multiple value types returned.
 
For example. I had a combined temperature and humidity sensor, 
but I didn't want to always get both values, and what would I call such a sensor 
that would be consistent with other devices that only had temperature. 

In code, I want to be able to get humidity without temperature and vice-versa. 
This makes it so that if I run the same logic on a device which only has a temperature sensor, everything
will still work.

A linked component looks like this. 

```
{"type": "link", "name": "rht11", "structure":{ "temperature": {"address": 9}, "humidity": {"address": 10}
	}}
```

Then, the linked components of temperature and humidity are described separately, as if they were distinct
components.
```
{"type": "humidity", "link": "rht11"},
{"type":"temperature", "name":"outside", "link": "rht11"}
 ```
                    
Using this method, we have a consistent way to get temperature from this linked sensor, 
or a temperature only sensor, but using `$$('temperature').get(callback)`

#### component.interface (string) required - valid values gpio | i2c | spi

Describes the hardware interface to the component. 

#### component.address (number | hex | string) 

This is the address of the component. Valid for each protocol are
```
gpio:	number
i2c:	hex or number
spi:	string of spi bus address eg: '/dev/spidev0.0'
```

#### component.structure (object)
Some components don't have a single address, or are a compilation of multiple components. 
You can provide a structure that describes the makeup of that component. 

As a simple example, take an RGB LED, the simple 4-prong type. You would not want to always turn on 
each address at the same time, so you can provide a structure. 
For example, an RGB LED may look like this. 
```
structure: {
	"red" : 15,
	"blue" : 16,
	"green": 17
}
``` 
where each entry in the structure points to an address.  
               
NOTE: a `structure` component is different from a `link` component where a `link` describes multiple
components on a single chip, a `structure` describes multiple addresses on a single component. The main 
difference being that a structure does not define it's components seperately. Using the rgb led example,
you wouldn't independently reference the red of a tri-color led, as the red component is likely not considered
screet. The same with say the 'x' axis of an accelerometer would rarely be considered completely outside the 
context of the other axiis.

#### component.name (string) required for linked components, optional for others
This is simply a descriptive name of the component which can be used to query a specific
component like an id in html.
For example, 
`{"type": "led", "name": "power"}` could be queried via `$$('led#power')`, or `$$('#power')`.

In a component of the type `link`, the name is very important because it is used to 'link' the component's
child descriptor back to the parent.

In the `link` example above.
```
{"type": "humidity", "link": "rht11"}
```
 was linked to 
 ```
 {"type": "link", "name": "rht11", "structure":{ "temperature": {"address": 9}, "humidity": {"address": 10}}}
 ``` 
 via the `name`.

#### component.formatInput (function)
This is a very important method for converting a consistent data input to an input which will work with 
your specific component. 

The function should accept a single value as an object or value, and output the value in the format the component
requires the input to be in.

This way, for coloured leds which require a different format for different types of leds, you could 
use a single common method of defining a color scheme, for example an object `{r: x, g: y, b: z}` and the 
format input to convert the input object into the format the chip requires to show the correct color.

#### component.get & component.set (array) i2c | Spi
##### i2c 
An array of objects which will be written to the i2c bus in order to interact 
with the component.

See interacting with i2c

##### spi
The buffer array to get passed to the component. 
Note do not create this as a buffer, just pass the array and it will be 
converted to a buffer before being submitted to the component.

#### component.methods (array of objects)
component methods allows you to specify special methods available to that component. One very important use for this is when 
you have a component which doesn't respond to the standard 
favorit get or set methods. You can provide your own get or set method within this object. 
When calling get or set, favorit will check to see if your component has it's own get or set method already defined.

An example component method 
```
{type: 'link', name: 'rht03', address: 8, methods: [
	{get: require('./linked_temp_humidity_mock')}], 
interface: 'gpio'}
```

The rht03 references above has a specific way of interacting with and cannot simply be read like a 
standard GPIO pin. Therefore, this code will run the get method which was provided in the methods array. 


### Interacting with i2c
i2c can be a bit special, and I found it really complicated to understand at first. 
There are a few things that need to happen to interact with an i2c component.

1) the component 'might' need to be initialized

2) the component 'might' need to send a series of bits and bytes to the device

3) the items that are sent might be of a read or write type.

Therefore, an i2c component has a few special methods

#### path (number) required
This is the path address on i2c bus. 

#### address (hex) required
This is the device address to send commands.

#### init get set (array || object)
Eeach command sent to the i2c bus is expected to be an array, if only one command needs to be sent, you
can provide a single object. 

The array holds a series of objects, each object representing a single command which is either write or read.

Each i2c command is made up of the following

##### type (string) 'write' | 'read' required
Quite simply this states weather the current command is a write or read command.

##### cmd (hex) 
This is the cmd sent to the device

##### val (hex || array of hex || true) optional
The values to write to the device.
Hex and arrays will be put into a buffer and sent to the device.

A value of true will pass an input value run an input value through formatInput if defined.
##### wait (number milliseconds) optional
Some i2c components require a time period to be passed before the next command
can be written. The `wait` attribute will pause after the current command is 
written and will continue with the next command in the array after the alloted 
time has been waited.

##### formatInput (function) optional
If defined, favorit will run the formatInput function and the output will be written to the device. 

An example of an i2c component is 
```
{type: 'accelerometer', address: 1, interface: 'i2c',
	init: [
		{type: 'write', addr: 0x2D, cmd: [1 << 3]},
		{type: 'write', addr: 0x31, cmd: [0x09]},
		{type: 'write', addr: 0x2c, cmd: [8 + 2 + 1]}, wait: 300],
	get: {type: 'read', addr: 0x33, cmd: 6}
},
{type: 'led', path: 2, address: 0x05,
	set: {type: 'write', cmd: 0x6E, val: true, 
	formatInput: function(val) {
		return [val.r, val.g, val.b];
}}, interface: 'i2c'},
```

In this example, the accelerometer is initialized by writing a series of commands, 
the get method itself is only a single object.

To get the accelometer value you would write `$$('accelerometer').get(callback)`.

The led, will take a passed in variable, transform it to meet the format required by the device,
and then set the color on the device. 

To set the led color to red, you would write `$$('led').set({r:255, g: 0, b: 0}, callback);

### Interacting with SPI

An SPI component will initialize itself if it is not already initialized, so you don't need to worry about
initializing or component setup.

#### address (string) required
The address string defines the location of the component on the SPI bus. 
These are being defined by a fully qualified path `/dev/spidev0.x` replace 'x' with
the location of your component on the spi bus.

If you path is something other than '/dev/spidev0.x', replace it accordingly.

#### mode (string) optional - not yet implemented

Sets the clock phase and polarity of the clock signal.

Valid values are 'MODE_0' through 'MODE_3'. The default is 'MODE_0'

#### chipSelect (string) optional - default 'low' - not yet implemented
Sets if the chip should go high or low to select.

Valid values are 'high' or 'low'.

#### get set init(object or array of objects)
Send a get or set command to the SPI device. 

The get/set array will be converted to a buffer before being sent to the device, 
so no need to write these as a buffer yourself.

```
{type: 'temperature', interface: 'spi',
			address: '/dev/spidev0.0',
			get: {val: [0x23, 0x48, 0xAF, 0x19, 0x19, 0x19]}
			}
```	


### Running favorit

I hope I've made it really simple to get using favorit.
Now, include the favorit module in your app. 

```
var favorit = require(path_to_your_favorit.js');
var $$ = require('favorit')()
```

A good way to set the path to your favorit.js file is as an environment variable,
which will give you good flexibility on running the same application across
different hardware.

### Kinda like jQuery
If you know jQuery (and even if you don't) I hope it won't take you too long to 
get the hang of using favorit.

#### Query like you know how
In order to interact with your hardware components, you'll query your device configuration file.

Though Favorit query parser is very similar to javascript DOM query engines you may be used to like jQuery
or `document.querySelector`, there are a few differences.

##### Query by component type
You'll most likely want to query by component type. If you are looking for the temperature from a 
temperature sensor, in your device configuration file, you will have defined at least one component with
the type `temperature`, and this would be queried as `$$('temperature')`.

##### Query by component name
When you want to specify a component, for example a drive motor on your device, you can query by name either 
using only the name `$$('#drive')`, or the name combined with the type `$$('motor#drive')`.

##### Query by other params
You can query by other params by using dot and comma notation. For example, to get all
the yellow and red leds, you can query with `$$('.red,yellow')`. This would get all components
that have any attribute where the value is either red or yellow.  

##### Getting data from a component
Simply use the `$$('temperature').get(callback)` and the temperature value returned by the temperature 
component will be passed as a value into the callback function you provide.

##### Setting data on a component
Simply use the `$$('led').set(value, callback)` and the value you set will be applied to the component.
For components where the set input value may not be consistent across similar components, it is
important to use the `formatInput` to convert a standardized input into one will work with the component
you are interacting with.

As Favorit matures, the goal is to settle on a standardized input formats for different types of components.