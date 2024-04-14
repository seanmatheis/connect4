var socket = new WebSocket('ws://172.20.10.3:81/');
socket.onmessage = function(event){
    console.log(event.data);

    let dataESP = event.data;
    //If opponent move, place physical piece
    if(dataESP.charAt(1) == 1){
        sensorValue = dataESP.charAt(4);
        if(currPlayer == playerYellow)
        {
            setPiecePhysical();
        }
    }

    //If both players are ready set the game
    if(dataESP.charAt(5) == 1 && gameSet == 0){
        physicalReady = dataESP.charAt(5);
        if(physicalReady == 1 && remoteReady == 1)
        {
            setGame();
            sendBitstream();
            gameSet = 1;
        }
    }

    /*
    //Get sensor value from incoming data
    if(dataESP.charAt(4) >= 0 && dataESP.charAt(4) <=6){
        sensorValue = dataESP.charAt(4);
        console.log(`Sensor Value:  ${sensorValue}`);
    }*/
}

//WEBSOCKET COMM: 
//BIT 0: Current Player's turn (currPlayer) physicalPlayer = 0, remotePlayer = 1;
//BIT 1: Winner (winner) physicalPlayer = 0, remotePlayer = 1, draw = 2, none = 3;
//Bit 2: Linear Actuator Position (linActPos) 0-6
//Bit 3: Value read from sensor (sensorValue) 0-6
//Bit 4-5: Ready (ready) not ready = 0, ready = 1
//Bit 6: Restart
let bitstreamSize = 8;
bitstream = new Array(bitstreamSize).fill(0);

var playerRed = "R";
var playerYellow = "Y";

//Virtual Player == red, remote == yellow
var remotePlayer = playerYellow;
var physicalPlayer = playerRed;

var startingPlayer;

//Variables for bitstream
var currPlayer;
var winner;
var linActPos;
var sensorValue;
var physicalReady;
var remoteReady;

var gameOver = false;
var gameSet;
//Array that represents the board
var board;

//Array use to represent current row (5 first, then counting down)
var currColumns;

var rows = 6;
var columns = 7;




window.onload = function(){

    //Decide Starting player randomly 
    startingPlayer = Math.round(Math.random());

    //Assign correct color to remote player
    if(startingPlayer == 0){
        currPlayer = playerYellow;
    }
    else{
        currPlayer = playerRed;
    }

    //Create start button, display until remote player is ready
    physicalReady = 0;
    remoteReady = 0;
    linActPos = 8;
    sensorValue = 0;
    gameSet = 0;
    restart = 1;
    sendBitstream();
    createStartButton();
}


//Creates a class for each tile on the board
function setGame(){
    board = [];
    currColumns = [5, 5, 5, 5, 5, 5, 5];

    //Remove event listener to restart game
    let currStatus = document.getElementById("currStatus");
    currStatus.removeEventListener("click", remoteReadyToggle);
    currStatus.classList.remove('startButton');



    for(let r = 0; r < rows; r++)
    {
        let row = [];

        for(let c = 0; c < columns; c++)
        {
            row.push(' ');

            //<div id="0-0" class = "tile"></div>
            let tile = document.createElement("div");        
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile");
            //Currently position is assigned by clicking the column, later switch to buttons??
            tile.addEventListener("click", setPieceRemote);
            document.getElementById("board").append(tile);
        }
        board.push(row);
    }


    //Initialize ready status

    




    //Update status bar
    updatePlayerAndSendData();


}

function resetGame(){

    //Reset board
    gameOver = false
    board = [];
    currColumns = [5, 5, 5, 5, 5, 5, 5];
    winner = "none";


    for(let r = 0; r < rows; r++)
    {
        let row = [];

        for(let c = 0; c < columns; c++)
        {
            row.push(' ');

            //<div id="0-0" class = "tile"></div>
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            //Remove class id
            tile.classList.remove("red-piece");
            tile.classList.remove("yellow-piece");

        }
        board.push(row);
    }


    /*
    if(currPlayer == playerYellow)
    {
        setPiecePhysical();
    }*/
}


function setPieceRemote(){


    if(gameOver){
        return;
    }

    //Coords is an array with two elements, row and col 
    let coords = this.id.split("-");
    //Parse as ints
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    linActPos = c;

    //Row is defined by gravity
    r = currColumns[c];
    if (r < 0){
        //invalid move
        return;
    }
    //Assign color to board position
    if(currPlayer == playerRed){

        //Assign board position to the current player
        board[r][c] = currPlayer;
        let tile = document.getElementById(r.toString() + "-" + c.toString());
        tile.classList.add("red-piece");
        //Switch current player turn
        currPlayer = playerYellow;

        updatePlayerAndSendData();
    }


    //Decrement row position so that next piece is placed on top
    r -= 1;
    currColumns[c] = r;

    //Check for winner
    checkWinner();

    //Update bitstream to esp
    sendBitstream();

    
}

function setPiecePhysical(){

    if(gameOver){
        return;
    }


    c = sensorValue;

    //Row is defined by gravity
    r = currColumns[c];
    if (r < 0){
        //invalid move
        return;
    }

    //Assign color to board position
    if(currPlayer == playerYellow){

        //Assign board position to the current player
        board[r][c] = currPlayer;
        let tile = document.getElementById(r.toString() + "-" + c.toString());
        tile.classList.add("yellow-piece");
        //Switch current player turn
        currPlayer = playerRed;

        updatePlayerAndSendData();
    }


    //Decrement row position so that next piece is placed on top
    r -= 1;
    currColumns[c] = r;

    //Check for winner
    checkWinner();



}

//temp function to generate random position, simulates sensor readings
function randSensorValue(){

    return Math.floor(Math.random() * (7));

}

function checkWinner(){


     // horizontal
     for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 3; c++){
           if (board[r][c] != ' ') {
               if (board[r][c] == board[r][c+1] && board[r][c+1] == board[r][c+2] && board[r][c+2] == board[r][c+3]) {
                   setWinner(r, c);
                   return;
               }
           }
        }
   }

   // vertical
   for (let c = 0; c < columns; c++) {
       for (let r = 0; r < rows - 3; r++) {
           if (board[r][c] != ' ') {
               if (board[r][c] == board[r+1][c] && board[r+1][c] == board[r+2][c] && board[r+2][c] == board[r+3][c]) {
                   setWinner(r, c);
                   return;
               }
           }
       }
   }

   // anti diagonal
   for (let r = 0; r < rows - 3; r++) {
       for (let c = 0; c < columns - 3; c++) {
           if (board[r][c] != ' ') {
               if (board[r][c] == board[r+1][c+1] && board[r+1][c+1] == board[r+2][c+2] && board[r+2][c+2] == board[r+3][c+3]) {
                   setWinner(r, c);
                   return;
               }
           }
       }
   }

   // diagonal
   for (let r = 3; r < rows; r++) {
       for (let c = 0; c < columns - 3; c++) {
           if (board[r][c] != ' ') {
               if (board[r][c] == board[r-1][c+1] && board[r-1][c+1] == board[r-2][c+2] && board[r-2][c+2] == board[r-3][c+3]) {
                   setWinner(r, c);
                   return;
               }
           }
       }
   }

}

function setWinner(r, c){

    if(board[r][c] == playerRed){
        winner = "Yellow Wins";
    }
    else{
        winner = "Red Wins";
    }

    /*
    //Change to status instead of just winner
    let currStatus = document.getElementById("currStatus");
    if(board[r][c] == playerRed){
        currStatus.innerText = "Red Wins";
    }
    else{
        currStatus.innerText = "Yellow Wins";
    }*/

    gameOver = true;
    sendBitstream();

    //Add implementation for restart button
    createRestartButton(winner);

}

function changeStatus(status){
    let currStatus = document.getElementById("currStatus");
    currStatus.innerText = status;
}

function createRestartButton(winner){

    let currStatus = document.getElementById("currStatus");
    currStatus.innerText = winner + " - Restart Game";
    if(winner == "Yellow Wins"){
        currStatus.classList.add('yellowWinsRestart');
    }
    else{
        currStatus.classList.add('redWinsRestart');
    }

    //Add event listener, user can restart game
    currStatus.addEventListener("click", restartGame);

}

function createStartButton(){
    let currStatus = document.getElementById("currStatus");
    currStatus.innerText = "Start Game";
    currStatus.classList.add('startButton');
    currStatus.addEventListener("click", remoteReadyToggle);
}

function remoteReadyToggle(){
    let currStatus = document.getElementById("currStatus");
    remoteReady = 1;
    if(remoteReady == 1 && physicalReady == 1){
        setGame();
        restart = 0;
        gameSet = 1;
    }
    else if(physicalReady == 0){
        currStatus.innerText = "Wait For Opponent";
        restart = 0;
    }
    sendBitstream();
}
function restartGame(winner){

    window.location.reload();

    /*
    //Remove event listener to restart game
    let currStatus = document.getElementById("currStatus");
    currStatus.removeEventListener("click", restartGame);

    //Remove button formatting
    currStatus.classList.remove('yellowWinsRestart');
    currStatus.classList.remove('redWinsRestart');


    //Call onload function again
    //Decide Starting player randomly 
    startingPlayer = Math.round(Math.random());

    //Assign correct color to remote player
    if(startingPlayer == 0){
        currPlayer = playerRed;
    }
    else{
        currPlayer = playerYellow;
    }

    updatePlayerAndSendData();

    resetGame();*/
}

function updatePlayerAndSendData(){

    //Update status bar
    if(currPlayer == playerYellow){
        changeStatus("Opponent's Turn");
    }
    else if(currPlayer == playerRed){
        changeStatus("Your Turn");
    }
    else{
        changeStatus("Error");
    }

}


function sendBitstream(){

    let currPlayerString;
    if(currPlayer == "Y"){currPlayerString = "0";}
    else{currPlayerString = "1";}

    let winnerString;
    if(winner == "Red Wins") {winnerString = "1";}
    else if(winner == "Yellow Wins") {winnerString = "0";}
    else (winnerString = "2");

    bitstream[0] = currPlayerString;
    bitstream[1] = winnerString;
    bitstream[2] = linActPos;
    bitstream[4] = physicalReady; 
    bitstream[5] = remoteReady;
    bitstream[6] = restart;


    let message = "<";
    for(let i = 0; i<bitstreamSize; i++){
        message = message.concat(bitstream[i]);
    }
    message = message.concat(">");

    socket.send(message);
}

  