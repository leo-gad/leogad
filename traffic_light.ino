#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

#define FIREBASE_HOST "my-api-1421f-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "BsinMLMGRWOYdGf2Xw4C6q5OaYUzmMEoDLQdHRSK"

const char* ssid = "EdNet";
const char* password = "Huawei@123";

#define LED_PIN D0  // Define the LED pin (GPIO5)

FirebaseData firebaseData;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT); // Initialize the LED pin as an output

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
}

void loop() {
  if (Firebase.getInt(firebaseData, "/led")) {
    int ledStatus = firebaseData.intData();
    if (ledStatus == 1) {
      digitalWrite(LED_PIN, HIGH);  // Turn the LED on
    } else {
      digitalWrite(LED_PIN, LOW); // Turn the LED off
    }
  } else {
    Serial.println(firebaseData.errorReason());
  }
  delay(1000);  // Delay to avoid spamming the database
}
