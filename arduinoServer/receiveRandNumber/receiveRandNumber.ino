#include <string.h>

const byte numChars = 32;
char receivedChars[numChars];
char sensorValue;
const int ledPin = 5;


boolean newData = false;

void setup() {
  Serial.begin(115200);
  Serial2.begin (9600, SERIAL_8N1, 16, 17);
  Serial.println("<Arduino is ready>");
  pinMode (ledPin, OUTPUT);
  digitalWrite (ledPin, LOW);
}

void loop() {
  recvWithStartEndMarkers();
  //showNewData();
  String newData = Serial2.readString();
  Serial.print(newData);
  Serial.println(newData[1]);
  sensorValue = newData[1];
  if(sensorValue == '1'){
    digitalWrite (ledPin, HIGH);
    delay(1000);
    digitalWrite (ledPin, LOW);
  }
}

void recvWithStartEndMarkers(){
  static boolean recvInProgress = false;
  static byte ndx = 0;
  char startMarker = '<';
  char endMarker = '>';
  char rc;

  while (Serial.available() > 0 && newData == false) {
        rc = Serial.read();

        if (recvInProgress == true) {
            if (rc != endMarker) {
                receivedChars[ndx] = rc;
                ndx++;
                if (ndx >= numChars) {
                    ndx = numChars - 1;
                }
            }
            else {
                receivedChars[ndx] = '\0'; // terminate the string
                recvInProgress = false;
                ndx = 0;
                newData = true;
            }
        }

        else if (rc == startMarker) {
            recvInProgress = true;
        }
    }
}

void showNewData() {
    if (newData == true) {
        Serial.print("This just in ... ");
        Serial.println(receivedChars);
        newData = false;
    }
}
