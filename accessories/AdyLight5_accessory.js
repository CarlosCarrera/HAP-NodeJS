// MQTT Setup

var mqtt = require('mqtt');
console.log("Connecting to MQTT broker...");


var options = {
  port: 1883,
  host: '192.168.0.37',
  clientId: 'AdyLight5'
};

var client = mqtt.connect(options);
console.log("AdyLight5 Connected to MQTT broker");

var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

// here's a fake hardware device that we'll expose to HomeKit
var ADY_LIGHT = {
  powerOn: false,
  setPowerOn: function(on) {
    console.log("Turning the AdyLight5 light %s!", on ? "on" : "off");
    if (on) {
      client.publish('AdyLight', 'on5');
      ADY_LIGHT.powerOn = on;
    } else {
      client.publish('AdyLight','off5');
      ADY_LIGHT.powerOn = false;
   };
  }, identify: function() {
    console.log("Identify the light!");
  }
}

// Generate a consistent UUID for our light Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "AdyLight".
var lightUUID = uuid.generate('hap-nodejs:accessories:Accesory3_1');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake light.
var light = exports.accessory = new Accessory('AdyLight_5', lightUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
light.username = "1A:2B:3D:4D:2E:AF";
light.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
light
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Carrera")
  .setCharacteristic(Characteristic.Model, "Rev-1")
  .setCharacteristic(Characteristic.SerialNumber, "A1S2NASF88EW");

// listen for the "identify" event for this Accessory
light.on('identify', function(paired, callback) {
  ADY_LIGHT.identify();
  callback(); // success
});

// Add the actual Lightbulb Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
light
  .addService(Service.Lightbulb, "AdyLight") // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    ADY_LIGHT.setPowerOn(value);
    callback(); // Our fake Light is synchronous - this value has been successfully set
  });

// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
light
  .getService(Service.Lightbulb)
  .getCharacteristic(Characteristic.On)
  .on('get', function(callback) {
    // this event is emitted when you ask Siri directly whether your light is on or not. you might query
    // the light hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.
    var err = null; // in case there were any problems
    if (ADY_LIGHT.powerOn) {
      console.log("Are we on? Yes.");
      callback(err, true);
    } else {
      console.log("Are we on? No.");
      callback(err, false);
    }
  });
