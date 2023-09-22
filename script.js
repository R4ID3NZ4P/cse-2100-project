//canvas
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;
let score = 0;
let highScore = 0;

//bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
};

//pipes
let pipes = new Array();
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;
let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2;
let velocityY = 0;
let g = 0.4;

//audio
let sfx_hit = new Audio("sfx_hit.wav");
let sfx_point = new Audio("sfx_point.wav");
let sfx_jump = new Audio("sfx_wing.wav");

//saving score in a file

let localHigh = localStorage.getItem("highScore");
if(localHigh) {
    highScore = parseInt(localHigh);
}



let gameOver = false;


window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "flappybird.png";

    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    document.addEventListener("keydown", moveBird);
}

function update() {
    requestAnimationFrame(update);
    if(gameOver) return;
    context.clearRect(0, 0, board.width, board.height);

    velocityY += g;
    bird.y = Math.max(bird.y + velocityY, 0);
    bird.y = Math.min(bird.y, boardHeight-24);

    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if(bird.y == boardHeight-24) gameOver = true;

    for(let i = 0; i < pipes.length; i++) {
        let pipe = pipes[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if(!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            sfx_point.play();
            pipe.passed = true;
        }

        if(colCheck(bird, pipe)) {
            gameOver = true;
            
        }

        while(pipes.length > 0 && pipes[0].x < -pipeWidth) {
            pipes.shift();
        }
    }

    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);
    
    if(gameOver) {
        sfx_hit.play();
        // highScore = (highScore > score) ? highScore : score;
        if(score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", score);
        }
        context.fillText("Game Over!", 5, 90);
        context.fillText(`High Score: ${highScore}`, 5, 135);
    }
}

function placePipes() {
    if(gameOver) return;
    let randPipeY = pipeY - pipeHeight/4 - Math.random()*pipeHeight/2;
    let openSpace = boardHeight/4;
    
    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    };

    pipes.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randPipeY + pipeHeight + openSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    };

    pipes.push(bottomPipe);
}

function moveBird(e) {
    if(e.code == "Space" || e.code == "ArrowUp") {
        velocityY = -6;
        sfx_jump.play();
    }

    if(gameOver) {
        gameOver = false;
        bird.y = birdY;
        pipes = [];
        score = 0;
        board.style.backgroundImage = "url('flappybirdbg.png')";
    }
}

function colCheck(a, b) {
    return  a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}