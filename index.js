const canvas = document.getElementById('game-canvas');
// ask the canvas to get a context to draw to the screen
const context = canvas.getContext('2d');

// track length of snake with class SnakePart
class SnakePart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

let speed = 7;

// set tile count per row or column
let tileCount = 20;
// prevent snake or apple from taking up the full 20px width / height of the tile
let tileSize = canvas.width / tileCount - 2;

// set the x and y position of the head of the snake
let headX = 10;
let headY = 10;
// array to hole the snake body parts as it grows
const snakeParts = [];
let tailLength = 2;

// set apple coordinates
let appleX = 5;
let appleY = 5;

let inputsXVelocity = 0;
let inputsYVelocity = 0;

let xVelocity = 0;
let yVelocity = 0;

// declare a mutable variable called score and set it to 0
let score = 0;

const gulpSound = new Audio('/assets/gulp.mp3');

let previousXVelocity = 0;
let previousYVelocity = 0;

// game loop; the game loop to continually update the screen
function drawGame() {
  xVelocity = inputsXVelocity;
  yVelocity = inputsYVelocity;

  // if currently moving right; prevent the snake changing direction & moving left & crashing into its own body
  if (previousXVelocity === 1 && xVelocity === -1) {
    xVelocity = previousXVelocity; // means the snake's direction will not change
  }

  // if currently moving left; prevent the snake changing direction & moving right & crashing into its own body
  if (previousXVelocity === -1 && xVelocity === 1) {
    xVelocity = previousXVelocity; // means the snake's direction will not change
  }

  // if currently moving up; prevent the snake changing direction & moving down & crashing into its own body
  if (previousYVelocity === -1 && yVelocity === 1) {
    yVelocity = previousYVelocity; // means the snake's direction will not change
  }

  // if currently moving down; prevent the snake changing direction & moving up & crashing into its own body
  if (previousYVelocity === 1 && yVelocity === -1) {
    yVelocity = previousYVelocity; // means the snake's direction will not change
  }

  previousXVelocity = xVelocity;
  previousYVelocity = yVelocity;

  changeSnakePosition();
  let result = isGameOver();
  // if the isGameOver function is true, the result variable will also be equal to true, and it means it's game over. This means that we will stop looping, we're no longer going to draw our game anymore and we're going to see the last thing that occurred on the screen .
  if (result) {
    // once we have game over, remove event listener so we stop taking keyboard inputs
    document.body.removeEventListener('keydown', keyDown);
    return;
  }

  clearScreen();

  checkAppleCollision();
  drawApple();
  drawSnake();

  drawScore();

  if (score > 5) {
    speed = 9;
  }

  if (score > 10) {
    speed = 11;
  }

  setTimeout(drawGame, 1000 / speed);
}

function isGameOver() {
  let gameOver = false;

  // prevent gameOver at the start of the game, where the head occupies the same space as the snake body part
  if (yVelocity === 0 && xVelocity === 0) {
    return false;
  }

  // wall checks:
  // set collision detection of the left-most wall
  if (headX < 0) {
    gameOver = true;
  }
  // the right-most wall
  else if (headX === tileCount) {
    gameOver = true;
  }
  // the top wall
  else if (headY < 0) {
    gameOver = true;
  }
  // the bottom wall
  else if (headY === tileCount) {
    gameOver = true;
  }

  // collision detection of snake parts
  for (let i = 0; i < snakeParts.length; i++) {
    let part = snakeParts[i];
    // check if that part.x position is occupying the same space as the snake head (the head x position).
    // check if that part.y position is also occupying the same space where the head.y position is
    if (part.x === headX && part.y === headY) {
      gameOver = true;
      break;
    }
  }

  if (gameOver) {
    context.fillStyle = 'DodgerBlue';
    context.font = '50px Verdana';

    const centerXAxis = canvas.width / 2;
    const centerYAxis = canvas.height / 2;
    context.textAlign = 'center';
    context.fillText('Game Over!', centerXAxis, centerYAxis);
  }

  return gameOver;
}

function drawScore() {
  context.fillStyle = 'white';
  context.font = '16px Verdana';
  // context.fillText(text, y , x). x and y is the x-axis and y-axis coordinates of the point at which the method starts drawing text.
  context.fillText('Score ' + score, canvas.width - 80, 25);
}

function clearScreen() {
  context.fillStyle = 'black';
  // context.fillRect(x, y, width, height)
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
  // draw green snake body parts
  context.fillStyle = 'green';
  for (let i = 0; i < snakeParts.length; i++) {
    let part = snakeParts[i];
    // context.fillRect(x, y, width, height)
    // part.x & part.y from SnakePart class
    context.fillRect(part.x * tileCount, part.y * tileCount, tileSize, tileSize);
  }

  // draw one snake part at a time, and put it in the position where the head was (headX & headY)
  snakeParts.push(new SnakePart(headX, headY)); // put an item at the end of the list, next to the head, as each part is drawn. This simulates animation / movement
  while (snakeParts.length > tailLength) {
    snakeParts.shift(); // remove the furthest item from the snake parts if we have more than our tail size
  }

  // draw head; drawn last as the last snake piece drawn is always on top
  context.fillStyle = 'orange';
  // context.fillRect(x, y, width, height)
  context.fillRect(headX * tileCount, headY * tileCount, tileSize, tileSize);
}

function changeSnakePosition() {
  // move head vertically
  headX = headX + xVelocity;
  // move head horizontally
  headY = headY + yVelocity;
}

function drawApple() {
  // set apple color to red
  context.fillStyle = 'red';
  // define apple as square
  // context.fillRect(x, y, width, height)
  context.fillRect(appleX * tileCount, appleY * tileCount, tileSize, tileSize);
}

// implement collision detection
// change the apple x and y position and draw a new apple in a new spot which makes it look like our apple disappears or has been eaten
function checkAppleCollision() {
  if (appleX === headX && appleY === headY) {
    // set our apple x position equal to a random number. Use math.random to give us a random number between 0 and 1. Use math.floor to round that random down. We take that number and multiply it by our tile count. (The tile count will be the max number that we can get, which is 20).
    appleX = Math.floor(Math.random() * tileCount);
    // repeat for apple position y
    appleY = Math.floor(Math.random() * tileCount);
    // increase tail length
    tailLength++;
    // increase score by 1 after eating an apple
    score++;
    // play gulp sound
    gulpSound.play();
  }
}

// implement keyboard listeners
document.body.addEventListener('keydown', keyDown);

function keyDown(event) {
  // up arrow is key code 38 || w is key code 87
  if (event.keyCode === 38 || event.keyCode === 87) {
    // Implement some guards: If our character is moving down, it shouldn't be able to move up, or it will crash into its own body... So exit the function.

    // move up on the y-axis
    inputsYVelocity = -1;
    // the snake will stop moving left or right if the up button is pressed
    inputsXVelocity = 0;
  }

  // down arrow is key code 40 || s is key code 83
  if (event.keyCode === 40 || event.keyCode === 83) {
    // Implement some guards: If our character is moving up, it shouldn't be able to move down, or it will crash into its own body... So exit the function.

    inputsYVelocity = 1;
    inputsXVelocity = 0;
  }

  // left arrow is key code 37 || a is key code 65
  if (event.keyCode === 37 || event.keyCode === 65) {
    // Implement some guards: If our character is moving left, it shouldn't be able to move right, or it will crash into its own body... So exit the function.

    inputsYVelocity = 0;
    inputsXVelocity = -1;
  }

  // right arrow (key code 39)
  if (event.keyCode === 39) {
    // Implement some guards: If our character is moving right, it shouldn't be able to move left, or it will crash into its own body... So exit the function.

    inputsYVelocity = 0;
    inputsXVelocity = 1;
  }
}

drawGame();
