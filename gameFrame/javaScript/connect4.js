console.log("TEST");

var playerRed = "R";
var playerYellow = "Y";

//Get selected color from previous page
const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
const remoteColor = urlParams.get('remoteColor');
console.log(remoteColor);

//Assign correct color to remote player
if(remoteColor == "red"){
    var currPlayer = playerRed;
    var remotePlayer = playerRed;
    var physicalPlayer = playerYellow;
}
else{
    var currPlayer = playerYellow;
    var remotePlayer = playerYellow;
    var physicalPlayer = playerRed;
}

var gameOver = false;
//Array that represents the board
var board;

//Array use to represent current row (5 first, then counting down)
var currColumns;

var rows = 6;
var columns = 7;


window.onload = function(){
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
            tile.addEventListener("click", setPiece)
            document.getElementById("board").append(tile);
        }
        board.push(row);
    }
}

function setPiece(){
    console.log("click");
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
    //Assign board position to the current player
    board[r][c] = currPlayer;
    let tile = document.getElementById(r.toString() + "-" + c.toString());
    //Assign color to board position
    if(currPlayer == playerRed){
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
    else{
        tile.classList.add("yellow-piece");
        //Swith current player turn
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
        changeStatus("Red Wins");
    }
    else{
        changeStatus("Yellow Wins")
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
}

function changeStatus(status){
    let currStatus = document.getElementById("currStatus");
    currStatus.innerText = status;
}

function sleep(ms) {
    console.log("Sleep Function called");
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  