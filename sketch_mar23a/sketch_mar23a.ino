#include <ESP8266WiFi.h>
#include <PubSubClient.h>

const char *ssid =  "vodafoneAEC8";    // cannot be longer than 32 characters!
const char *pass =  "FR95JA42CAAH3C";    //

// Update these with values suitable for your network.
IPAddress server(192, 168, 0, 37);

const int relay = 13;
const int relay_2 = 12;

#define BUFFER_SIZE 100

void callback(const MQTT::Publish& pub) {
  // handle message arrived
  Serial.print(pub.topic());
  Serial.print(" => ");

    Serial.println(pub.payload_string());
//Accessory 1
    if(pub.payload_string() == "on1") {
      digitalWrite(relay, HIGH);
    } else if(pub.payload_string() == "off1"){
      digitalWrite(relay, LOW);
    }
//Accessory 2
    if(pub.payload_string() == "on2") {
      digitalWrite(relay_2, HIGH);
    } else if(pub.payload_string() == "off2") {
      digitalWrite(relay_2, LOW);
    }
}

WiFiClient wclient;
PubSubClient client(wclient, server);

void setup() {

  pinMode(relay, OUTPUT);
  pinMode(relay_2, OUTPUT);

  // Setup console
  Serial.begin(115200);
  delay(10);
  Serial.println();
  Serial.println();

  client.set_callback(callback);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("Connecting to ");
    Serial.print(ssid);
    Serial.println("...");
    WiFi.begin(ssid, pass);

    if (WiFi.waitForConnectResult() != WL_CONNECTED)
      return;
    Serial.println("WiFi connected");
  }
  if (WiFi.status() == WL_CONNECTED) {
    if (!client.connected()) {
      if (client.connect("ESP8266: AdyLight")) {
          client.publish("outTopic","hello world");
          client.subscribe("AdyLight");
      }
    }
    if (client.connected()) {
      client.loop();
    }
  }
}
