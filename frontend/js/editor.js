var canvas = document.querySelector("#drawer");
var context = canvas.getContext("2d");
const CELL_SIZE = 5;
var cameraZoom = 1
const MAX_ZOOM = 5
const MIN_ZOOM = 0.1
const SCROLL_SENSITIVITY = 0.0005
var toggleButtonForAsciiLetters = document.getElementsByClassName("letter-btn")[0];
var letters = document.getElementsByClassName("letter");
let chosenSymbol = "x";
let chosenColor = "#000000";
let fillingColor = "#000000";
let isFilling = false;
var drawField = document.getElementsByClassName("draw-field")[0];
var toggleButtonForColors = document.getElementsByClassName("color-btn")[0];


// STORE MATRIX TEXT
let numberOfColumns = Math.floor(window.innerWidth / CELL_SIZE);
let numberOfRows = Math.floor(window.innerWidth / CELL_SIZE);

let matrixForAsciiText = [];
let asciiText = "";

function drawCells() {
    for (i = 0; i < window.innerHeight; i += CELL_SIZE) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(canvas.width, i);
        context.lineWidth = 0.05;
        context.stroke();
    }
    for (i = 0; i < window.innerWidth; i += CELL_SIZE) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, canvas.width);
        context.lineWidth = 0.05;
        context.stroke();
    }
}

function adjustZoom(zoomAmount, zoomFactor) {
    let isDragging = false
    let lastZoom = cameraZoom
    if (!isDragging) {
        if (zoomAmount) {
            cameraZoom += zoomAmount
        }
        else if (zoomFactor) {
            cameraZoom = zoomFactor * lastZoom
        }

        cameraZoom = Math.min(cameraZoom, MAX_ZOOM)
        cameraZoom = Math.max(cameraZoom, MIN_ZOOM)
    }
}

canvas.addEventListener('wheel', function zoom(e) {
    adjustZoom(e.deltaY * SCROLL_SENSITIVITY);
});

// from ascii code 32 to 126
function addAsciiCharacters() {
    const START_ASCII_CODE = 32;
    const FINISH_ASCII_CODE = 126;
    let letters = document.getElementsByClassName("letters")[0];
    for (let i = START_ASCII_CODE; i < FINISH_ASCII_CODE; ++i) {
        let letter = document.createElement("button");
        letter.classList.add("letter");
        letter.innerHTML = String.fromCharCode(i);
        letters.appendChild(letter);
    }
}

function toggleAsciiCharacters() {
    toggleButtonForAsciiLetters.addEventListener("click", function () {
        document.getElementsByClassName("letters")[0].classList.toggle("open");
    });
}

function chooseCharacter() {
    for (let i = 0; i < letters.length; ++i) {
        letters[i].addEventListener("click", function () {
            chosenSymbol = letters[i].textContent;
            document.getElementsByClassName("letters")[0].classList.toggle("open");
        });
    }
}

function setColors() {
    document.getElementById("color").addEventListener("change", function (e) {
        chosenColor = e.target.value;
    })

    document.getElementById("fill-color").addEventListener("change", function (e) {
        fillingColor = e.target.value;
    })
}

function clickButtonForFillingColor() {
    if(document.getElementsByClassName("chosen-letter")[0]) {
        document.getElementsByClassName("chosen-letter")[0].addEventListener("click", function () {
            drawField.style.cursor = "crosshair";
            isFilling = false;  
        })
    }
    document.getElementsByClassName("color-btn")[0].addEventListener("click", function () {
        drawField.style.cursor = "crosshair";
        isFilling = false;
    })
    document.getElementsByClassName("fill-btn")[0].addEventListener("click", function () {
        drawField.style.cursor = "default";
        isFilling = true;
    })
}

function getAsciiText () {

}

// call functions after DOM is loaded
document.addEventListener("DOMContentLoaded", function (event) {
    drawCells();
    addAsciiCharacters();
    toggleAsciiCharacters();
    chooseCharacter();
    setColors();
    clickButtonForFillingColor();
    floodFill(event.pageX, event.pageY);
    initializeMatrix();
    getAsciiText();
});

window.addEventListener("load", () => {
    drawCells();
    resize();
    document.addEventListener("mousedown", startPainting);
    document.addEventListener("mouseup", stopPainting);
    document.addEventListener("mousemove", sketch);
    window.addEventListener('resize', resize);
})

function resize() {
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
}

let startCoord = { x: 0, y: 0 };
let isStartedPainting = false;
let arrayFromUsedPoints = [];
let yCoordinates = [];
let xCoordinates = [];

function getPosition(event) {
    startCoord.x = event.clientX - canvas.offsetLeft;
    startCoord.y = event.clientY - canvas.offsetTop;
}

function transformCoordinates(x,y) {
    let xRemainder = x % 20;
    let yRemainder = y % 20;
    if (yRemainder <= 10) {
        newY = y - yRemainder;
    } else {
        newY = y + (20 - yRemainder);
    }
    if (xRemainder <= 10) {
        newX = x - xRemainder;
    } else {
        newX = x + (20 - xRemainder);
    }
    return {x, y};
}

function initializeMatrix() {
    matrixForAsciiText = new Array(numberOfColumns * numberOfRows);
    matrixForAsciiText.fill("s");
}

function startPainting(event) {
    if(isFilling) return;
    let {x,y} = transformCoordinates(event.pageX, event.pageY);
    context.font = "20px sans-serif";
    context.fillStyle = chosenColor;
    matrixForAsciiText[(x-1)*numberOfColumns + y] = chosenSymbol;
    context.fillText(chosenSymbol, x,y);
    arrayFromUsedPoints.push({x: x, y:y});
    yCoordinates.push(y);
    xCoordinates.push(x);
    context.moveTo(x,y);
    getPosition(event);
    isStartedPainting = true;
    getPosition(event);
}

function stopPainting() {
    isStartedPainting = false;
}

function hasPointAtCoordinates(point) {
    for (let i = 0; i < arrayFromUsedPoints.length; ++i) {
        if (Math.abs(arrayFromUsedPoints[i].x - point.x) <= 5 && Math.abs(arrayFromUsedPoints[i].y - point.y) <= 5) {
            return true;
        }
    }
    return false;
}

function sketch(event) {
    if (!isStartedPainting) return;
    if (isFilling) return;
    context.beginPath();

    // FONT SIZE AND SIZE OF CELLS: 20PX
    currentPoint = { x: event.pageX, y: event.pageY };
    skipThisPoint = hasPointAtCoordinates(currentPoint);
    arrayFromUsedPoints.push(currentPoint);

    let xRemainder = Math.floor(currentPoint.x) % 20;
    let yRemainder = Math.floor(currentPoint.y) % 20;
    if (xRemainder <= 10) {
        currentPoint.x -= xRemainder;
    } else {
        currentPoint.x += (20 - xRemainder);
    }
    if (yRemainder <= 10) {
        currentPoint.y -= yRemainder;
    } else {
        currentPoint.y += (20 - yRemainder);
    }
    if (!skipThisPoint) {
        context.font = "20px sans-serif";
        context.fillStyle = chosenColor;
        context.fillText(chosenSymbol, currentPoint.x, currentPoint.y);
        matrixForAsciiText[(currentPoint.x-1)*numberOfColumns + currentPoint.y] = chosenSymbol;
        context.moveTo(currentPoint.x, currentPoint.y);
        yCoordinates.push(currentPoint.y);
        xCoordinates.push(currentPoint.x);
        getPosition(event);
    }
}

function isValidCoordinates(x,y) {
    if(x < 0 || y < 0) {
        return false;
    }
    if(x > window.innerWidth || y > window.innerHeight) {
        return false;
    }
}

function fillCanvas(x,y) {
    if(!isValidCoordinates(x,y)) {
        return;
    }

    // if(isAlreadyFilled) {
    //     return;
    // }
    fillCanvas(x+1,y);
    fillCanvas(x-1,y);
    fillCanvas(x,y+1);
    fillCanvas(x,y-1);
}

function floodFill(x,y) {
    if(!isFilling) {
        fillCanvas(x,y);
    }
}