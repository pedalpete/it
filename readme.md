#Favor.it
## A simple library for interacting with IoT devices.

Favor.it is a javascript/node.js library to abstract away complex and inconsistent hardware interfaces into a single simple to use API.

## What's supported?
Currently Favor.it has been tested on RaspberryPi, but any device which runs node should work. I'll be testing with other devices shortly. 

GPIO is the only interface type currently supported. More will be coming shortly, or you can use the component specific get method to interact with other devices now (I think).


### How Does It Work?

Favor.it uses a json file which describes the structure of your hardware, and queries this json file, similar to how jQuery parses and interacts with the DOM. Once favor.it knows what devices are connected, and how to interact with them, you can easly write jQuery like statements like `$$('temperature').get()`` will get you the temperature on any device running favor.it. 

Favor.it brings three things to the table. 
1) a consistent api for interacting with different devices
2) a separation of concerns between hardware and software
3) write-once run-anywhere type code.

### How do we get started?

First, you'll need to create your favorit.json file. 
This file describes your hardware setup. 

The favorit.json file is made up of

##### name (string)
This is a name for your device. It does not have to be unique, but in the future may be used to identify your device.

##### components (array)
This array holds each of your hardware components, for example, thermometers, motors, etc. etc. 
I have a lot of work to do in defining what descriptors can be used, but you can always query on whatever keys you create. However, in the future, for interoperability, it will be prudent for me to create a proper list of supported keys and values. 

##### component.type (string)
The idea behind a type is that it describes what the device does, more than what it is, if possible. So for thermometers, I've been using `temperature` as the type description, and for humidity, I've been using `humidity`. LED's have been `led`, and button is `button`. Again, you can use any type you like for now, but I'll try to put some more recommendations around that as more gets figured out. 

For more information of  the 'link' component type, see below

##### component.interface (string) GPIO
Currently GPIO is the only supported interface type, but I'm looking forward to adding SPI and i2c.

##### component.address (number)
This is the GPIO pin number at the moment, as only GPIO is currently supported. If an address is not provided, the structure must be.

##### component.structure (object)
Some components don't have a single address, or are a compilation of multiple components. You can provide a structure that describes the makeup of that component. 

As a simple example, take an RGB LED, the simple 4-prong type. You would not want to always turn on each address at the same time, so you can provide a structure. For example, an RGB LED may look like this. 
```structure: { "red" : 15,
                "blue" : 16,
                "green": 17
                }```
                
Or a sensor that has temperature and humidity can describe both of those options and the respective pins in it's structure. 

##### component.name (string) required for linked components
This is simply a descriptive name of the component. The exception is a component of type 'link' where the name is very important. See description of 'link' below.

##### component.methods (object)
the component methods allows you to specify special methods available to that component. One very important use for this is when you have a component which doesn't respond to the standard favor.it get or set methods. You can provide your own get or set method within this object. When calling get or set, favor.it will check to see if your component has it's own get or set method already defined.

When a component has it's own get or set method, the component is passed into it's own get method so you can retrieve and set any variables on the component itself. 

As your methods will be functions and are therefore not valid json, create your methods as a node.js module, and provide the path to the module as if you were going to require the module. When favor.it starts-up, it will build it's object and include all your methods via require statements.  


##### link components component.type:'link'
A linked component is a special type of component where other components are linked to it, most likely as a descriptor. 
For example. I had a combined temperature and humidity sensor, but I didn't want to always get both values, and what would I call such a sensor that would be consistent with other devices that only had temperature. So I created a linked component like this. 

```{"type":"link","name":"rht11", "methods":[ {"get":"../tests/mocks/linked_temp_humidity.js"}],"structure":{"temp":{"address":9},"humidity":{"address":10}}}```

This linked component also happened to have it's own get method.
Then, I described both the temperature and humidity components on their own.
```{"type":"humidity","link":"rht11","return_as":"humidity"},
                    {"type":"temperature", "name":"outside","link":"rht11","return_as":"temp"}```
                    
Using this method, we have a consistent way to get temperature from this linked sensor, or a temperature only sensor, but using
`$$('temperature').get()`

### Running Favor.it

I hope I've made it really simple to get using favor.it.
Now, include the favor.it module in your app. 

`var $$ = require('favor.it')()`
NOTE: you start favor.it as a function, so don't forget the extra params at the end. If you don't want to have your favorit.json file in the root path of your app, you can define a path within the function call like this
`var $$ = require('favor.it')(path_to_your_favorit.json)`

### Kinda like jQuery
If you know jQuery (and even if you don't) I hope it won't take you too long to get the hang of using favor.it.

#### Get one or get many
Favor.it has a very rudamentary pluralizer and the return from a query will return the first result only, unless you pluralize. 
`$$('temperature')` will return only the the first sensor. 
`$$('temperatures')` will return all the temperature sensors on that device.  (no idea why I thought this was important). 

`$$('.green')` will get you anything that has a value of green on any key, and will return all of them. There is no such thing as 'greens'. 

Sorry for ducking out now, much more, and more documentation to come. Hit me up with any questions. 


