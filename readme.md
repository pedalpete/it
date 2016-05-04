#Favor
![Favor Logo](https://avatars0.githubusercontent.com/u/6392732?v=3&u=f09ed61c17bb341847c81028090c36c5b005aa8b&s=200)

[![bitHound Overall Score](https://www.bithound.io/github/favor/it/badges/score.svg)](https://www.bithound.io/github/favor/it)
[![bitHound Dependencies](https://www.bithound.io/github/favor/it/badges/dependencies.svg)](https://www.bithound.io/github/favor/it/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/favor/it/badges/code.svg)](https://www.bithound.io/github/favor/it)

# A simple library for creating hardware agnostic IoT devices.

Favor is a javascript/node.js library to abstract away complex and inconsistent hardware interfaces into a single simple to use API.

## In a nutshell

Have you ever wanted to write 

`$$('temperature').get(function(temp) { console.log('The temperature is ', temp) };`

Well, now you can, and run on multiple devices without mixing business logic with device configuration considerations.

Check out the demo video of getting started with Favor.
[![demo hello world led video](http://i3.ytimg.com/vi/bHKyFJ41amA/hqdefault.jpg)](https://www.youtube.com/watch?v=bHKyFJ41amA "Getting Started With Favor")

### What do you mean by Hardware agnostic

In this sense, hardware agnostic means that you can write your business logic
without needing to worry about what hardware it will run on. 

Currently Favor works with linux based devices like the Raspberry Pi, Beaglebone
and others. But more than just the hardware platform, with Favor you can run
your application on different chips and sensors, without needing to consider
what type of chip the application is runnning on, or even what protocol (gpio, I2C, SPI).

Favor makes it possible to run your application on completely different hardware.

Other platforms are currently in the process of being supported, and more
protocols can be added as well. Need something special? Just ask!

### Supported Versions of node
Favor has been tested with node v4, it should also work with v5. v0.10 and v0.12 have not been tested and may not work. 

## What's supported?
Currently Favor has been tested on RaspberryPi v1b and Beaglebone Black, 
but any linux device which runs node.js should work. I'll be happy to test with other devices,
I just need to get access to them.
 
Favor works with GPIO, i2C and SPI protocols.

### How Does It Work?

Favor uses a js configuration file stored on your device which describes the structure of your hardware.
It queries this js file, similar to how jQuery parses and interacts with the DOM. 
Once Favor knows what devices are connected, and how to interact with them, 
you can easly write jQuery style statements like `$$('temperature').get(callback)`
 will get you the temperature on any device running Favor which has a temperature sensor. 

### What are the benefits of Favor 
1) a single consistent api for interacting with different devices and protocols

2) a separation of concerns between hardware and software

3) write-once run-anywhere 

4) testable logic which will run across different hardware devices

### Installing

`npm install favor`

### See the favor wiki for more documentation
[Favor Wiki](https://github.com/favor/it/wiki)

### Live-code example of getting data from a temperature sensor

[![Get Temperature - live code](http://i3.ytimg.com/vi/ujHa-I3ZRUM/hqdefault.jpg)](https://www.youtube.com/watch?v=ujHa-I3ZRUM "Get Temperature live-code example")