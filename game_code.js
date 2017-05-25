//references to document elements
var buttonLevel = document.getElementById('buttonNextLevel');
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var canvasImage = document.getElementById('imageCanvas');
var ctxImage = canvasImage.getContext('2d');

//game
var gameOver = false;
var points = 0;
var maxLevel = 3;

//variables in localStorage
var level = localStorage.getItem('level');
if (level == null || level > maxLevel) {
    localStorage.setItem('level', 1);
}
console.log("Level: " + level);
buttonLevel.innerText = "Level " + level;

//dx and dy changes the position of the ball
var dx = 2;
var dy = -2;
var dmax = 5;

var paddle = {
    height: 10,
    width: 75,
    x: (canvas.width - this.width) / 2,
    xMax: canvas.width - 75,
    resetPosition: function () { x = (canvas.width - this.width) / 2; } 
};

//ball variables
var dark_purple = "#800040";
var dark_lila = "#655ccc";
var dark_blue = "#6238b6";
var medium_blue = "#0095DD";
var dark_orange = "#6238b6";
var medium_green = "#6238b6";
var colors = [dark_purple, dark_lila, dark_blue, medium_blue, dark_orange, medium_green];
var ballColor = medium_blue;

//var ball = { x: 0, y: 0, radius: 10, color: medium_blue, speed: 2, maxSpeed: 5 };
var ballRadius = 10;
var minBallRadius;

//set the position of the ball
var x = canvas.width / 2;
var y = canvas.height - paddle.height - ballRadius;

var rightPressed = false;
var leftPressed = false;

var brickRowCount;
var brickColumnCount;
var brickWidth;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;

console.log(typeof level);
switch (level) {

    case '2': brickColumnCount = 5; brickRowCount = 2; brickWidth = 60; lives = 3; ballRadius = 8; minBallRadius = 5; dx = 3; dy = -3; dmax = 5; console.log("switch:2"); break;
    case '3': brickColumnCount = 6; brickRowCount = 4; brickWidth = 50; lives = 2; ballRadius = 7; minBallRadius = 5; dx = 4; dy = -4; dmax = 7; console.log("switch:3"); break;
    case '1': default: brickColumnCount = 5; brickRowCount = 1; brickWidth = 75; lives = 3; ballRadius = 10; minBallRadius = 7; dx = 3; dy = -3; dmax = 5; console.log("switch:1"); break;
}

brickOffsetLeft = (canvas.width - (brickColumnCount * brickWidth)) / (1 + brickColumnCount);

var score = 0;
var max_score = brickRowCount * brickColumnCount;

//create a 2-dim array of objects-bricks
var bricks = [];

    for (c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (r = 0; r < brickRowCount; r++) {

            var brickX = (c * brickWidth) + (brickOffsetLeft * (c + 1));
            var brickY = (r * brickHeight) + (brickPadding * (r)) + brickOffsetTop;

            bricks[c][r] = { x: brickX, y: brickY, visible: true };
        }
    }

//create array of links to images
    var imageSources = ['level1.jpg',
                        'level2.jpg',
                        'level3.png'];

    var img = new Image();
    img.onload = function () { ctxImage.drawImage(img, 0, 0, canvasImage.width, canvasImage.height); };
    img.src = imageSources[level-1];

    var blockColumnCount = brickColumnCount;
    var blockRowCount = brickRowCount;
    var blockWidth = Math.ceil(canvasImage.width / blockColumnCount);
    console.log("blockWidth:" + blockWidth);
    console.log("blockWidth * blockCol:" + blockWidth*blockColumnCount);
    var blockHeight = Math.ceil(canvasImage.height / blockRowCount);
    var blocksLeft = blockColumnCount * blockRowCount;
    var blocks = createBlocks(blockColumnCount, blockRowCount, blockWidth, blockHeight);

    var randBlockIndexes = (function (a, b) { while (a--) b.push(a); return b; })(blockColumnCount * blockRowCount, []); //arr=[0.. blocks.length-1]
    var randBlockIndexes = shuffle(randBlockIndexes);
    console.log(randBlockIndexes);

    function createBlocks(blockColumnCount, blockRowCount, blockWidth, blockHeight) {

        var array = [];

        for (c = 0; c < blockColumnCount; c++) {
            for (r = 0; r < blockRowCount; r++) {
                var blockX = c * blockWidth;
                var blockY = r * blockHeight;

                array.push({ x: blockX, y: blockY, visible: true });
            }
        }

        return array;
    }

    function drawBlocks() {

        var length = blocks.length;
        for (i = 0; i < length; ++i) {
            if (blocks[i].visible) {
                var b = blocks[i];
                ctxImage.beginPath();
                ctxImage.rect(b.x, b.y, blockWidth, blockHeight);
                ctxImage.fillStyle = "white";
                ctxImage.fill();
                ctxImage.closePath();
            }
        }
    }

    function drawImage() {

        ctxImage.drawImage(img, 0, 0, canvasImage.width, canvasImage.height);
    }

    function revealRandomBlock() {

        if (randBlockIndexes.length)
            blocks[randBlockIndexes.pop()].visible = false;
    }

    function shuffle(array) {

        var length = array.length;
        if (length < 2)
            return array;

        var rand;

        for (i = 0; i < length; ++i) {

            rand = Math.floor(Math.random() * length);

            if (i != rand) {
                //switch elements
                var temp = array[i];
                array[i] = array[rand];
                array[rand] = temp;
            }
        }
        return array;
    }

function drawBricks() {

    for (c = 0; c < brickColumnCount; c++) {
        for (r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].visible) {
                var b = bricks[c][r];
                ctx.beginPath();
                ctx.rect(b.x, b.y, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawBall() {

    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.closePath();
}

function changeBallColor() {

    ballColor = colors[Math.floor(Math.random() * colors.length)];
}

function drawPaddle() {

    if (paddle.x > paddle.xMax) {
        paddle.x = paddle.xMax;
    }
    else if (paddle.x < 0) {
        paddle.x = 0;
    }

    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawLines() {
    ctx.beginPath();
    ctx.lineWidth = "2";
    ctx.strokeStyle = "blue";
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.stroke();
}

function draw() {
    //Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    //drawLives();
    
    collisionDetection();
    drawImage();
    drawBlocks();

    //Change coordinates of the ball
    x += dx;
    y += dy;

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
        changeBallColor();
    }

    if (y + dy < ballRadius) {
        dy = -dy;
        changeBallColor();
    } else if (y + dy > canvas.height - ballRadius) //the ball hit the bottom wall
    {
        if (x >= paddle.x && x <= paddle.x + paddle.width) {
            dy = -dy; //change movement from down to up (or the opposite)
        } else {

            --lives;

            if (!lives) {
                gameOver = true;
                drawLoseMessage();
            }
            else {               
                resetBallPosition();
                paddle.resetPosition();
            }
        }
    }

    drawLives();

    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += 7;
    }
    else if (leftPressed && paddle.x > 0) {
        paddle.x -= 7;
    }

    if (gameOver == false)
        requestAnimationFrame(draw);
}

function resetBallPosition() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    if (dx < 0)
        dx *= (-1);
    if(dy>0)
        dy *= (-1);
}

function keyDownHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = true;
    }
    else if (e.keyCode == 37) {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = false;
    }
    else if (e.keyCode == 37) {
        leftPressed = false;
    }
}

function collisionDetection() {
    for (c = 0; c < brickColumnCount; c++) {
        for (r = 0; r < brickRowCount; r++) {
            var b = bricks[c][r];
            if (b.visible) {
                //if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                if (x + ballRadius >= b.x && x - ballRadius <= b.x + brickWidth && y + ballRadius >= b.y && y - ballRadius <= b.y + brickHeight) {
                    //the player hit a brick
                    console.log("ball:" + x + ", " + y + "\nbrick:" + b.x + ", " + b.y);
                    dy = -dy; //change up-down direction
                    b.visible = false;
                    ++score;
                    points += lives; //for hitting a brick player gets 3, 2 or 1 point

                    localStorage.setItem('level', level); //Save 
                    localStorage.setItem('points', points);

                    revealRandomBlock();

                    if (score == max_score) {

                        drawWinMessage();
                        
                        gameOver = true;
                        ++level; 

                        //update level
                        if (level <= maxLevel) {
                            buttonLevel.innerText = "Level " + level;
                        }
                        else {
                            drawGameOverMessage();
                            alert("Brawo! Pys wygrał! Ale zajaczek ma dla Ciebie jeszcze jedna zabawe! Oto pierwsza podpowiedz: \"Idz zrobic pranko! Ot, takie male zadanko!\"");
                        }
                        //Save game stats for the next level
                        localStorage.setItem('level', level);
                    }

                    if (score % 3 == 0 && ballRadius > minBallRadius) {
                        --ballRadius;
                        increaseBallSpeed();
                    }

                    changeBallColor();
                }
            }
        }
    }
}

function increaseBallSpeed() {
    if (Math.abs(dy) < dmax) {
        dy = (dy < 0) ? dy - 1 : dy + 1;
        dx = (dx < 0) ? dx - 1 : dx + 1;
    }
}

function drawLoseMessage() {
    ctx.font = "50px Arial";
    ctx.fillStyle = "red";
    var textSize = ctx.measureText("YOU LOSE");
    ctx.fillText("YOU LOSE", (canvas.width - textSize.width) / 2, canvas.height / 2);
}

function drawLostLifeMessage() {

        ctx.font = "50px Arial";
        ctx.fillStyle = "#0095DD";
        var textSize = ctx.measureText("YOU LOST A LIFE");
        ctx.fillText("YOU LOST A LIFE", (canvas.width - textSize.width) / 2, canvas.height / 2);
}

function drawWinMessage() {
    ctx.font = "50px Arial";
    ctx.fillStyle = medium_green;
    var textSize = ctx.measureText("YOU WON");
    ctx.fillText("YOU WON", (canvas.width - textSize.width) / 2, canvas.height / 2);
}

function drawGameOverMessage() {
    ctx.font = "50px Arial";
    ctx.fillStyle = medium_green;
    var textSize = ctx.measureText("GAME OVER");
    ctx.fillText("GAME OVER", (canvas.width - textSize.width) / 2, (canvas.height / 2) + 50);
}

function drawPlayButton() {
    var x = document.createElement("BUTTON");
    var t = document.createTextNode("Click me");
    x.appendChild(t);
    x.addEventListener('OnClick', newGameButtonHandler, false);
    document.body.appendChild(x);
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Bricks: " + score, 8, 20);
    //var textSize = ctx.measureText("Points: " + points);
    //ctx.fillText("Points: " + points, (canvas.width - textSize.width) / 2, 20);
    var textSize = ctx.measureText("Level: " + level);
    ctx.fillText("Level: " + level, (canvas.width - textSize.width) / 2, 20);
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;

    }
}

function newGameButtonHandler(e) {

    localStorage.setItem('level', 1);

    document.location.reload();
}

function nextLevelButtonHandler(e) {

    document.location.reload();
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);


draw();
