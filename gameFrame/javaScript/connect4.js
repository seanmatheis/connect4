//var socket = new WebSocket('ws://10.0.0.61:81');
//socket.send("Connected to Game");

var playerRed = "R";
var playerYellow = "Y";

//Virtual Player == red, remote == yellow
var remotePlayer = playerRed;
var physicalPlayer = playerYellow;

var startingPlayer;
var currPlayer;
var winner;

//Get selected color from previous page
//GET RID OF PREVIOUS PAGE
/*
const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
const remoteColor = urlParams.get('remoteColor');
console.log(remoteColor);*/


var gameOver = false;
//Array that represents the board
var board;

//Array use to represent current row (5 first, then counting down)
var currColumns;

var rows = 6;
var columns = 7;

//Initialize sensor value to invalid position
var sensorValue = 8;


window.onload = function(){

    //Decide Starting player randomly 
    startingPlayer = Math.round(Math.random());
    console.log(startingPlayer);

    //Assign correct color to remote player
    if(startingPlayer == 0){
        currPlayer = playerRed;
    }
    else{
        currPlayer = playerYellow;
    }

    //Update status bar
    if(currPlayer == physicalPlayer){
        changeStatus("Opponent's Turn");
    }
    else if(currPlayer == remotePlayer){
        changeStatus("Your Turn");
    }
    else{
        changeStatus("Error");
    }
    setGame();
}


//Creates a class for each tile on the board
function setGame(){
    board = [];
    currColumns = [5, 5, 5, 5, 5, 5, 5];


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

    if(currPlayer == playerYellow)
    {
        setPiecePhysical();
    }
}

function resetGame(){

    //Reset board
    gameOver = false
    board = [];
    currColumns = [5, 5, 5, 5, 5, 5, 5];


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

    if(currPlayer == playerYellow)
    {
        setPiecePhysical();
    }
}


function setPieceRemote(){
    console.log("click");
    //socket.send("Click");
    if(gameOver){
        return;
    }

    //Coords is an array with two elements, row and col 
    let coords = this.id.split("-");
    //Parse as ints
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

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
        console.log(c);
        let tile = document.getElementById(r.toString() + "-" + c.toString());
        //socket.send("Red:led:esp:localhost");
        tile.classList.add("red-piece");
        //Switch current player turn
        currPlayer = playerYellow;

        //Update status bar
        if(currPlayer == physicalPlayer){
            changeStatus("Opponent's Turn");
        }
        else if(currPlayer == remotePlayer){
            changeStatus("Your Turn");
        }
        else{
            changeStatus("Error");
        }
    }


    //Decrement row position so that next piece is placed on top
    r -= 1;
    currColumns[c] = r;

    //Check for winner
    checkWinner();

    //Call function that places remote player's piece
    setPiecePhysical();
    
}

function setPiecePhysical(){

    if(gameOver){
        return;
    }

    //Set invalid sensor value until correct value is recieved
    sensorValue = 8;

    //While loop waits until value from sensor is received
    while(sensorValue == 8){
        //Eventually get value from websocket, currently randomly generated
        c = randSensorValue();
        sensorValue = c;
    }


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
        console.log(c);
        let tile = document.getElementById(r.toString() + "-" + c.toString());
        //socket.send("Red:led:esp:localhost");
        tile.classList.add("yellow-piece");
        //Switch current player turn
        currPlayer = playerRed;

        //Update status bar
        if(currPlayer == physicalPlayer){
            changeStatus("Opponent's Turn");
        }
        else if(currPlayer == remotePlayer){
            changeStatus("Your Turn");
        }
        else{
            changeStatus("Error");
        }
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
        winner = "Red Wins";
    }
    else{
        winner = "Yellow Wins";
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
    if(winner == "Red Wins"){
        currStatus.classList.add('redWinsRestart');
    }
    else{
        currStatus.classList.add('yellowWinsRestart');
    }

    //Add event listener, user can restart game
    currStatus.addEventListener("click", restartGame);

}

function restartGame(winner){

    //Remove event listener to restart game
    let currStatus = document.getElementById("currStatus");
    currStatus.removeEventListener("click", restartGame);

    //Remove button formatting
    currStatus.classList.remove('yellowWinsRestart');
    currStatus.classList.remove('redWinsRestart');


    //Call onload function again
    //Decide Starting player randomly 
    startingPlayer = Math.round(Math.random());
    console.log(startingPlayer);

    //Assign correct color to remote player
    if(startingPlayer == 0){
        currPlayer = playerRed;
    }
    else{
        currPlayer = playerYellow;
    }

    //Update status bar
    if(currPlayer == physicalPlayer){
        changeStatus("Opponent's Turn");
    }
    else if(currPlayer == remotePlayer){
        changeStatus("Your Turn");
    }
    else{
        changeStatus("Error");
    }
    resetGame();
}

  