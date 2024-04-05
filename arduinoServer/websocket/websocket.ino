#include <WiFi.h>
#include <ArduinoWebsockets.h>

using namespace websockets;
WebsocketsClient socket;
const char* websocketServer = "ws://172.20.10.3:81/";
boolean connected = false;
const int ledPin = 5;

const char* ssid = "SeanPhone"; 
const char* password = "iamspeed";

//Global Variables meant to be shared wit system
//data from server
String dataServer;
//data from mega
String dataMega;
String bitstream;
int currPlayer;
int winner;
int LinActPos;
char sensorValue;
char player2Ready;
char player1Ready;
int readyButton = 1;


void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
  connectWiFi();
  connectWebSocket();

  socket.onMessage(handleMessage);
  socket.onEvent(handleEvent);

  //LED For testing purposes
  pinMode (ledPin, OUTPUT);
  digitalWrite (ledPin, LOW);

  Serial.print("Setup Complete");

  //Take out later
  currPlayer = 2;
/*
  while(!connected) { 
    Serial.println("Connecting to WebSocket server");
    connectWebSocket();
    delay(2000);
  }*/

  //Wait for ready signal from physical player
  while(player2Ready != '1'){
    dataMega = Serial2.readString();
    player2Ready = dataMega[5];
  }

}

void loop() {





//Current player - physical player, read from mega
  if(currPlayer == 0){

    //dataMega = Serial2.readString();
    //Test with random number
    //Get data from mega
    //dataMega = "<0006000>";
    //sensorValue = dataMega[4];

    //Send sensor data to websocket
    //dataServer[4] = sensorValue;
    //socket.send(dataServer);
  }
  //Current Player - remote player read from server n
  else if(currPlayer == 1){
    socket.poll();
    delay(2000);
  }
  //Current Player - undefined
  else{
    //Initialize data packets
    dataServer = "<02001100>";

  }

  //socket.send(dataServer);
  //Serial2.println(dataServer);
  Serial.println(dataServer);
  Serial2.println(dataServer);
  //Serial.println(dataMega);
  delay(3000);



}

void handleMessage(WebsocketsMessage message){
  Serial.println(message.data());
  Serial2.println(message.data());
  String dataServer = message.data();
  parseData(dataServer);


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

void parseData(String dataServer){

  currPlayer = dataServer[1] - '0';
  winner = dataServer[2] - '0';
  LinActPos = dataServer[3] - '0';

  Serial2.println(dataServer);


}
