const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = "800";
canvas.height = "500";
let highScore = 0;
let score = 0;
let gameFrame = 0;
let speedOffset = 20;
let gameSpeed = 1;
let canvasPosition = canvas.getBoundingClientRect();
ctx.font = "bold 48px serif";
let hitbox = false;
let gameOver = false;
const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  click: false,
};

//end game handlers

const reset = () => {
  gameOver = false;
  if (score > highScore) {
    highScore = score;
  }
  score = 0;
  enemy1.x = -50;
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
};
// reset();
const tryAgainHandler = () => {
  if (
    mouse.x > canvas.width / 4 &&
    mouse.x < canvas.width - canvas.width / 4 &&
    mouse.y > canvas.height / 4 &&
    mouse.y < canvas.height - canvas.height / 4
  ) {
    console.log("mouse click on box detected");
    console.log("resetting game");
    reset();
    animate();
  } else {
    console.log("mouse.x:", mouse.x);
    console.log("mouse.y:", mouse.y);
  }
};
//mouse handlers
canvas.addEventListener("mousedown", function (event) {
  mouse.click = true;
  mouse.x = event.x - canvasPosition.left;
  mouse.y = event.y - canvasPosition.top;
  //gameOverHandler
  if (gameOver) {
    tryAgainHandler();
  }
  // console.log(mouse.x, mouse.y);
});
canvas.addEventListener("mouseup", () => {
  mouse.click = false;
});

//Player
const playerLeft = new Image();
playerLeft.src = "./sprites/red_fish_left.png";
const playerRight = new Image();
playerRight.src = "./sprites/red_fish_right.png";

class Player {
  constructor() {
    this.x = canvas.width;
    this.y = canvas.height / 2;
    this.radius = 50;
    this.angle = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.spriteWidth = 498;
    this.spriteHeight = 327;
  }
  update() {
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    let theta = Math.atan2(dy, dx);
    this.angle = theta;
    if (mouse.x != this.x) {
      this.x -= dx / speedOffset;
    }
    if (mouse.x != this.x) {
      this.y -= dy / speedOffset;
    }
  }
  draw() {
    if (hitbox) {
      if (mouse.click) {
        ctx.linewidth = 0.2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
      ctx.fillRect(this.x, this.y, this.radius, 10);
    }
    if (gameFrame % 5 == 0) {
      this.frame++;
      this.frameX++;
      this.frameY += this.frameX == 4 ? 1 : 0;
      this.frameX %= 4;
      this.frameY %= 3;
    }
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    if (this.x >= mouse.x) {
      ctx.drawImage(
        playerLeft,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        0 - 60,
        0 - 45,
        this.spriteWidth / 4,
        this.spriteHeight / 4
      );
    } else {
      ctx.drawImage(
        playerRight,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        0 - 60,
        0 - 45,
        this.spriteWidth / 4,
        this.spriteHeight / 4
      );
    }
    ctx.restore();
  }
}

//Bubbles
const bubblesArray = [];
const bubbleImage = new Image();
bubbleImage.src = "./sprites/bubble_pop_frame_01.png";
class Bubble {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 100 + Math.random() * canvas.height;
    this.radius = 50;
    this.speed = Math.random() * 5 + 1;
    this.distance;
    this.counted = false;
  }
  update() {
    this.y -= this.speed;
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    this.distance = Math.sqrt(dx * dx + dy * dy);
  }
  draw() {
    //hitbox
    if (hitbox) {
      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
      ctx.stroke();
    }
    ctx.drawImage(
      bubbleImage,
      this.x - 65,
      this.y - 65,
      this.radius * 2.6,
      this.radius * 2.6
    );
  }
}

//bubble sounds
const bubblePop1 = document.createElement("audio");
bubblePop1.src = "./sounds/pop1.ogg";
const bubblePop2 = document.createElement("audio");
bubblePop2.src = "./sounds/pop2.ogg";
const bubblePop3 = document.createElement("audio");
bubblePop3.src = "./sounds/pop3.ogg";
const bubblePop4 = document.createElement("audio");
bubblePop4.src = "./sounds/pop4.ogg";
const bubbleSounds = [bubblePop1, bubblePop2, bubblePop3, bubblePop4];

//bubble handler
function handleBubbles() {
  if (gameFrame % 50 == 0) {
    bubblesArray.push(new Bubble());
    // console.log(bubblesArray);
  }
  //if bubbles float off the top, delete them
  for (let i = 0; i < bubblesArray.length; i++) {
    // console.log(i, bubblesArray[i]);
    bubblesArray[i].update();
    bubblesArray[i].draw();
    if (bubblesArray[i].y < -0 - this.radius * 2.5) {
      bubblesArray.splice(i, 1);
      i--;
    }
    //if bubbles touch, pop them
    if (bubblesArray[i].distance < bubblesArray[i].radius + player.radius) {
      console.log("collision detected");
      if (bubblesArray[i].counted == false) {
        bubbleSounds[Math.floor(Math.random() * bubbleSounds.length)].play();
        bubblesArray[i].counted = true;
        score++;
        bubblesArray.splice(i, 1);
      }
      i--;
    }
  }
}

//repeating background
const background = new Image();
background.src = "background1.png";

const BG = {
  x1: 0,
  x2: canvas.width,
  y: 0,
  width: canvas.width,
  height: canvas.height,
};
function handleBackground() {
  //two copies of the background to rotate around each other.
  BG.x1 -= gameSpeed;
  //gameSpeed moves the background.
  if (BG.x1 < -BG.width) BG.x1 = BG.width;
  //if bg is moved off screen, move to the right
  BG.x2 -= gameSpeed;
  if (BG.x2 < -BG.width) BG.x2 = BG.width;

  //draw the background
  ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height);
  ctx.drawImage(background, BG.x2, BG.y, BG.width, BG.height);
}

//enemies

const enemyImage = new Image();
enemyImage.src = "./sprites/enemy_01.png";

class Enemy {
  constructor() {
    this.x = canvas.width + 200;
    this.y = Math.random() * (canvas.height - 150) + 90;
    this.radius = 60;
    this.speed = Math.random() * 2 + 2;
    this.frame = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.spriteWidth = 418;
    this.spriteHeight = 397;
  }
  draw() {
    //visualize the hitboxes
    if (hitbox) {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    //9 arguments; srcImg, spriteSheetX, spriteSheetY, spriteWidth,spriteHeight, spriteCanvasX, spriteCanvasY, spriteRenderWidth, spriteRenderHeight
    ctx.drawImage(
      enemyImage,
      this.frameX * this.spriteWidth,
      this.frameY * this.spriteHeight,
      this.spriteWidth,
      this.spriteHeight,
      this.x - 60,
      this.y - 70,
      this.spriteWidth / 3,
      this.spriteHeight / 3
    );
  }
  update() {
    //move to the left at this.speed
    this.x -= this.speed;
    //if the fish reaches the left, spawn again.
    if (this.x < 0 - this.radius) {
      this.x = canvas.width + 200;
      this.y = Math.random() * (canvas.height - 150) + 90;
      this.speed = Math.random() * 2 + 2;
    }
    //animate the sprite 1 frame every 5 game frames
    if (gameFrame % 5 == 0) {
      this.frame++;
      this.frameX++;
      this.frameY += this.frameX == 4 ? 1 : 0;
      this.frameX %= 4;
      this.frameY %= 3;
    }

    // overlap detection
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < this.radius + player.radius) {
      handleGameover();
    }
  }
}
const enemy1 = new Enemy();
function handleEnemies() {
  enemy1.draw();
  enemy1.update();
}
function handleGameover() {
  ctx.strokeStyle = "lime";
  ctx.lineWidth = 15;
  ctx.strokeRect(
    canvas.width / 4,
    canvas.height / 4,
    canvas.width / 2,
    canvas.height / 2
  );
  ctx.fillStyle = "green";
  ctx.fillRect(
    canvas.width / 4,
    canvas.height / 4,
    canvas.width / 2,
    canvas.height / 2
  );
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(
    "GAME OVER!",
    canvas.width / 2,
    (canvas.height / 3) * 1.2,
    (canvas.width / 2) * 0.8
  );
  ctx.fillText(
    "you scored: " + score,
    canvas.width / 2,
    (canvas.height / 3) * 1.6,
    (canvas.width / 2) * 0.8
  );
  ctx.fillText(
    "Try Again?",
    canvas.width / 2,
    (canvas.height / 3) * 2,
    (canvas.width / 2) * 0.8
  );
  //set gameOver to true to stop animation loop
  gameOver = true;
  mouse.x = 0;
  mouse.y = 0;
  tryAgainHandler();
}
//animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  handleBackground();
  player.draw();
  player.update();
  handleBubbles();
  handleEnemies();
  ctx.textAlign = "left";
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 10, 50);
  ctx.fillText("High Score: " + highScore, 450, 50);
  gameFrame++;
  //game continues if !gameOver
  if (!gameOver) {
    requestAnimationFrame(animate);
  }
}

const player = new Player();
animate();

window.addEventListener("resize", () => {
  canvasPosition = canvas.getBoundingClientRect();
});
