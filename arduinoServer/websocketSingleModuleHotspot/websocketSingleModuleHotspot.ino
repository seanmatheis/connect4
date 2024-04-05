#include <WiFi.h>
#include <ArduinoWebsockets.h>

using namespace websockets;
WebsocketsClient socket;
const char* websocketServer = "ws://172.20.10.3:81";
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
char currPlayer;
char winner;
char LinActPos;
String sensorValue;
int sensorValueInt;
char physicalReady;
char remoteReady;
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

  //Initialize ready status
  physicalReady = '1';
  remoteReady = '1';

  //Initialize currPlayer to 2;
  currPlayer = '2';



}

void loop() {


  while(!connected) { 
    Serial.println("Connecting to WebSocket server");
    connectWebSocket();
    delay(2000);
  }



  //Current player - physical player, read from mega
  if(currPlayer == '0'){

    //Simulate waiting for linear actuator
    //Send data to mega
    //wait for response from mega
    delay(5000);


    //Get data from sensor currently random
    sensorValueInt = random(0, 7);
    sensorValue = String(sensorValueInt);

    currPlayer = '1';
    changeCurrPlayer();
    
    //Create data packet
    createDataPacket();
    Serial.println(dataMega);
    socket.send(dataMega);

    delay(1000);

    

    




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
  else if(currPlayer == '1'){



  }
  //Current Player - undefined
  else{
  }

/*
  while(currPlayer == '1'){
    Serial.println("loop");
    socket.poll();
  }*/

  socket.poll();




}

void handleMessage(WebsocketsMessage message){
  Serial.println(message.data());
  Serial2.println(message.data());
  dataServer = message.data();
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

  currPlayer = dataServer[1];
  winner = dataServer[2];
  LinActPos = dataServer[3];

}

void createDataPacket(){
  dataMega = dataServer;
  dataMega[4] = sensorValue[0];
  Serial.println(dataServer);
  Serial.println(dataMega);
}

void changeCurrPlayer(){
  dataMega[1] = '1';
  dataServer[1] = '1';
}
