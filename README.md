# **Connect4 Installation Guide**

## Download XAMPP in C drive - https://www.apachefriends.org/

## In "C:\xampp\htdocs" create project folder

## In "C:\xampp\htdocs\projectFolder" add following files from final product folder
  ### - connect4Large.css
  ### - connect4Small.css
  ### - connect4WS.js
  ### - connect4Xsmall.css
  ### - index.php
  ### - websocket.php

## The files websocketSingleModuleHotspot.ino and websocketSingleModuleHotspotInverted.ino must be uploaded to an ESP32
## The file websocketSingleModuleHotspot.ino gives the user the visual experience of playing Connect 4 across from the opponent.
## The file websocketSingleModuleHotspotInverted.ino allows the user to see the board from the same perspective as the physical user.

## To use these files on a personal device, there are a few places an IP address must be changed
## Find the IPv4 address of your current device on the network you would like to use

## For the following files change the code to match your IP address
  ### connect4WS.js, line 1:
    var socket = new WebSocket('ws://IPAddress:81/');
  ### websocket.php, line 43:
    $app = new Ratchet\App("IPAddress", 81, "0.0.0.0");
  ### websocketSingleModuleHotspot.ino/websocketSingleModuleHotspotInverted.ino, line 6:
    const char* websocketServer = "ws://IPAddress:81";

## Open XAMPP Control Panel
  ### Next to Apache, click start
  ### Next to MySQL, click start

## Open terminal
  ### Navigate to "C:\xampp\htdocs\projectFolder"
  ### run "php websocket.php"

## Open browser
  ### Navigate to "localhost/projectFolder/index.php"

## The websocket terminal should display that there is a new connection
## Turn on the esp32, the terminal will display when the esp32 is connected, this may take around 20-30 seconds
The user interface is now connected to the physical board
Press start game when ready to play, the game will start when your opponent is also ready.
