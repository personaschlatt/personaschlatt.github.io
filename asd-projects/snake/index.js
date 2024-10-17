/* global $, sessionStorage*/

////////////////////////////////////////////////////////////////////////////////
///////////////////////// VARIABLE DECLARATIONS ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// HTML jQuery Objects
var board = $("#board");
var scoreElement = $("#score");
var highScoreElement = $("#highScore");

// TODO 4a: Create the snake, apple and score variables
var snake = {};
var apple = {};

// Game Variables
var score = 0;

// Constant Variables
var ROWS = 20;
var COLUMNS = 20;
var SQUARE_SIZE = 20;
var KEY = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
};

// interval variable required for stopping the update function when the game ends
var updateInterval;

// variable to keep track of the key (keycode) last pressed by the user
var activeKey;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////// GAME SETUP //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// TODO: turn on keyboard inputs
$("body").on("keydown", handleKeyDown);

// start the game
init();

function init() {
  // TODO 4c-2: initialize the snake
  snake.body = [];

  makeSnakeSquare(10, 10);
  snake.head = snake.body[0];
  // TODO 4b-2: initialize the apple
  makeApple();
  // TODO 5a: Initialize the interval
  updateInterval = setInterval(update, 100);
}

////////////////////////////////////////////////////////////////////////////////
///////////////////////// PROGRAM FUNCTIONS ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function update() {
  moveSnake();
  
  if (hasHitWall() || hasCollidedWithSnake()) {
    endGame();
  }
  
  if (hasCollidedWithApple()) {
    handleAppleCollision();
  }
}

function checkForNewDirection(event) {
  /* 
  TODO 6b: Update snake.head.direction based on the value of activeKey.
  
  BONUS: Only allow direction changes to take place if the new direction is
  perpendicular to the current direction
  */

  // FILL IN THE REST
  if (activeKey === KEY.LEFT && snake.head.direction !== "right") {
    snake.head.direction = "left";
  } 
  else if (activeKey === KEY.RIGHT && snake.head.direction !== "left") {
    snake.head.direction = "right";
  } 
  else if (activeKey === KEY.UP && snake.head.direction !== "down") {
    snake.head.direction = "up";
  } 
  else if (activeKey === KEY.DOWN && snake.head.direction !== "up") {
    snake.head.direction = "down";
  }

  console.log(snake.head.direction);     
}

function moveSnake() {
  checkForNewDirection();

  // Determine the next row and column for the snake's head
  let newRow = snake.head.row;
  let newCol = snake.head.column;

  if (snake.head.direction === "left") {
    newCol -= 1;
  }
  else if (snake.head.direction === "right") {
    newCol += 1;
  }
  else if (snake.head.direction === "up") {
    newRow -= 1;
  }
  else if (snake.head.direction === "down") {
    newRow += 1;
  }

  // Move the head
  snake.head.row = newRow;
  snake.head.column = newCol;
  
  // Reposition the head
  repositionSquare(snake.head);

  // Move the rest of the body
  for (let i = snake.body.length - 1; i > 0; i--) {
    snake.body[i].row = snake.body[i - 1].row;
    snake.body[i].column = snake.body[i - 1].column;
    repositionSquare(snake.body[i]);
  }
}

function hasHitWall() {
  // Return true if the snake's head has hit the wall
  if (snake.head.row < 0 || snake.head.row >= ROWS || snake.head.column < 0 || snake.head.column >= COLUMNS) {
    return true;
  }
  return false;
}

function hasCollidedWithApple() {
  // Return true if the snake's head has collided with the apple
  return snake.head.row === apple.row && snake.head.column === apple.column;
}

function handleAppleCollision() {
  // increase the score and update the score DOM element
  score++;
  scoreElement.text("Score: " + score);

  // Remove existing Apple and create a new one
  apple.element.remove();
  makeApple();

  // Add a new segment to the snake body
  var tail = snake.body[snake.body.length - 1];
  var newSegment = {};
  newSegment.row = tail.row;
  newSegment.column = tail.column;
  newSegment.direction = tail.direction;
  makeSnakeSquare(newSegment.row, newSegment.column);
}

function hasCollidedWithSnake() {
  // Return true if the snake's head has collided with any part of the snake's body
  for (let i = 1; i < snake.body.length; i++) {
    if (snake.head.row === snake.body[i].row && snake.head.column === snake.body[i].column) {
      return true;
    }
  }
  return false;
}

function endGame() {
  // stop update function from running
  clearInterval(updateInterval);

  // clear board of all elements
  board.empty();

  // update the highScoreElement to display the highScore
  highScoreElement.text("High Score: " + calculateHighScore());
  scoreElement.text("Score: 0");
  score = 0;

  // restart the game after 500 ms
  setTimeout(init, 500);
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function makeApple() {
  apple.element = $("<div>").addClass("apple").appendTo(board);

  var randomPosition = getRandomAvailablePosition();

  apple.row = randomPosition.row;
  apple.column = randomPosition.column;

  repositionSquare(apple);
}

function makeSnakeSquare(row, column) {
  var snakeSquare = {};

  snakeSquare.element = $("<div>").addClass("snake").appendTo(board);

  snakeSquare.row = row;
  snakeSquare.column = column;

  repositionSquare(snakeSquare);

  if (snake.body.length === 0) {
    snakeSquare.element.attr("id", "snake-head");
  }
  snake.body.push(snakeSquare);
  snake.tail = snakeSquare;
}

function handleKeyDown(event) {
  activeKey = event.which;
  console.log(activeKey);
}

function repositionSquare(square) {
  var squareElement = square.element;
  var row = square.row;
  var column = square.column;

  var buffer = 20;

  squareElement.css("left", column * SQUARE_SIZE + buffer);
  squareElement.css("top", row * SQUARE_SIZE + buffer);
}

function getRandomAvailablePosition() {
  var spaceIsAvailable;
  var randomPosition = {};

  while (!spaceIsAvailable) {
    randomPosition.column = Math.floor(Math.random() * COLUMNS);
    randomPosition.row = Math.floor(Math.random() * ROWS);
    spaceIsAvailable = true;

    for (let i = 0; i < snake.body.length; i++) {
      if (snake.body[i].row === randomPosition.row && snake.body[i].column === randomPosition.column) {
        spaceIsAvailable = false;
        break;
      }
    }
  }

  return randomPosition;
}

function calculateHighScore() {
  var highScore = sessionStorage.getItem("highScore") || 0;

  if (score > highScore) {
    sessionStorage.setItem("highScore", score);
    highScore = score;
    alert("New High Score!");
  }

  return highScore;
}
