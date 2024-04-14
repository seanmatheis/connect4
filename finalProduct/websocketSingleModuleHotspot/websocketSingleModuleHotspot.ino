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
String dataIn;
char currPlayer;
char winner;
char LinActPos;
char restart;
String sensorValue;
String sensorValueFromMega;
int sensorValueInt;
char physicalReady;
char remoteReady;
int readyButton = 1;
int bothReady;


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

  //Initialize Data Streams
  dataMega = "<00000000>";
  dataServer = "<02800000>";

  //Initialize ready status
  physicalReady = '0';
  remoteReady = '0';
  bothReady = 0;

  //Initialize currPlayer to 2;
  currPlayer = '2';

}

void loop() {


  while(!connected) { 
    Serial.println("Connecting to WebSocket server");
    connectWebSocket();
    delay(2000);
  }


  //Wait unit both players press ready button
  while(bothReady == 0)
  {

    
    if(physicalReady != '1'){
      dataIn = Serial2.readString();
      if(dataIn[5] == '1'){
        physicalReady = '1';
      }

      if(physicalReady == '1'){
        createPhysicalReady();
        socket.send(dataMega);
      }
    }


    if(physicalReady == '1' && remoteReady == '1'){
      Serial2.println(dataServer);
      bothReady = 1;
      break;
      break;
    }

    socket.poll();
    
  }



  //Current player - physical player, read from mega
  if(currPlayer == '0'){

    //Simulate waiting for linear actuator
    //Send data to mega
    Serial.println(dataServer);
    Serial2.println(dataServer);

    sensorValue = "8";

    while(sensorValue == "8"){
      dataIn = Serial2.readString();
      sensorValueFromMega = dataIn[4];
      //Serial.println("Sensor Value From Mega: ");
      //Serial.println(sensorValueFromMega);
      if(sensorValueFromMega == "0" || sensorValueFromMega == "1" || sensorValueFromMega == "2" || sensorValueFromMega == "3" || sensorValueFromMega == "4" || sensorValueFromMega == "5" ||sensorValueFromMega == "6"){
          sensorValue = sensorValueFromMega;
      }

      Serial.print("o");
      if(sensorValue != "8"){
        break;
        break;
      }
      delay(100);
    }

    //Get data from mega
    Serial.println("Data Coming from Mega: ");
    Serial.println(dataIn);

    //Send to socket
    //Create data packet
    createDataPacket();
    currPlayer = '1';
    changeCurrPlayer();
    //Serial.println(dataMega);
    socket.send(dataMega);

    delay(100);

  }
  //Current Player - remote player read from server n
  else if(currPlayer == '1'){



  }
  //Current Player - undefined
  else{
  }

  if(winner == '0' || winner == '1' || restart == '1'){
    bothReady = 0;
    physicalReady = '0';
    remoteReady = '0';
  }

  socket.poll();




}

void handleMessage(WebsocketsMessage message){
  Serial.println(message.data());
  //Serial2.println(message.data());
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
  restart = dataServer[7];

/*
  if(restart == '1'){
    bothReady = 0;
    physicalReady = '0';
    remoteReady = '0';
  }*/

  if(dataServer[6] == '1'){
    remoteReady = '1';
  }
  else{
    remoteReady = '0';
  }

}

void receiveFromMega(String dataMega){
  sensorValue = dataMega[4];
  physicalReady = dataMega[5];
}

void createPhysicalReady(){

  dataMega = dataServer;
  dataMega[5] = physicalReady;
}

void createDataPacket(){
  dataMega = dataServer;
  dataMega[4] = sensorValue[0];
  dataMega[1] = currPlayer;
  Serial.println("Data Packet being sent: ");
  Serial.println(dataMega);
}

void changeCurrPlayer(){
  dataMega[1] = '1';
  dataServer[1] = '1';
}