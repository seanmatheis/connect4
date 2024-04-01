#include <WiFi.h>
#include <ArduinoWebsockets.h>

using namespace websockets;
WebsocketsClient socket;
const char* websocketServer = "ws://10.0.0.61:81/";
boolean connected = false;
const int ledPin = 5;

const char* ssid = "MeatOrchard"; 
const char* password = "polloshermanos42069";

//Global Variables meant to be shared wit system
String data;
int currPlayer;
int winner;
int LinActPos;
int sensorValue;


void setup() {
  Serial.begin(115200);
  connectWiFi();
  connectWebSocket();

  socket.onMessage(handleMessage);
  socket.onEvent(handleEvent);

  //LED For testing purposes
  pinMode (ledPin, OUTPUT);
  digitalWrite (ledPin, LOW);

  Serial.print("Setup Complete");

}

void loop() {
  if(!connected) { 
    Serial.println("Connecting to WebSocket server");
    connectWebSocket();
  }

  socket.poll();



}

void handleMessage(WebsocketsMessage message){
  Serial.println(message.data());
  String data = message.data();
  parseData(data);


}

void handleEvent(WebsocketsEvent event, WSInterfaceString data){

}

void connectWebSocket() { 
  connected = socket.connect(websocketServer);
  if (connected) { 
    Serial.println("Connected to Web Socket");
  }
  else { 
    Serial.println("Connection failed.");
  }
}

void connectWiFi() {
  WiFi.mode(WIFI_OFF);
  delay(1000);
  //This line hides the viewing of ESP as wifi hotspot
  WiFi.mode(WIFI_STA);
  
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
    
  Serial.print("connected to : "); Serial.println(ssid);
  Serial.print("IP address: "); Serial.println(WiFi.localIP());
}

void parseData(String data){

  const char * c = data.c_str();
  Serial.println(c);

  String varName;
  int value;

  sscanf(c, "%s:%d", varName, value);

  Serial.println(varName);
  Serial.println(value);
  Serial.println("Variable updated");



}
