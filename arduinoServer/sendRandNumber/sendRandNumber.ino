int message[32];
int num;

void setup() {
  Serial.begin(9600);
  
}

void loop() {

  num = random(0,6);
  message[0] = num;
  Serial.print("<");
  for(int i=0; i<32; i++)
  {
    Serial.print(message[i]);
  }
  Serial.print(">");
  Serial.print("\n");
  delay(2000);

}
