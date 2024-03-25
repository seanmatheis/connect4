#include <WiFi.h> 
#include <HTTPClient.h> 

String URL = "http://10.0.0.61/connect4/testData.php";

const char* ssid = "MeatOrchard"; 
const char* password = "polloshermanos42069"; 

int currPlayer = 50; 
int sensorVal = 50;
int linActPos = 50;


void setup() {
  Serial.begin(115200); 
  connectWiFi();
  Serial.print("TEST");
}

void loop() {

  if(WiFi.status() != WL_CONNECTED) { 
    connectWiFi();
  }

  String postData = "currPlayer=" + String(currPlayer) + "&sensorVal=" + String(sensorVal) + "&linActPos=" + String(linActPos);

  HTTPClient http;
  http.begin(URL);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  
  int httpCode = http.POST(postData); 
  String payload = http.getString(); 
  
  Serial.print("URL : "); Serial.println(URL); 
  Serial.print("Data: "); Serial.println(postData); 
  Serial.print("httpCode: "); Serial.println(httpCode); 
  Serial.print("payload : "); Serial.println(payload); 
  Serial.println("--------------------------------------------------");


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