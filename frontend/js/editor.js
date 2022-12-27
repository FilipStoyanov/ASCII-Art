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
let isFilling = false;
let minCol = Infinity;
let maxCol = -Infinity;
let minRow = Infinity;
let maxRow = -Infinity;
var drawField = document.getElementsByClassName("draw-field")[0];
var toggleButtonForColors = document.getElementsByClassName("color-btn")[0];
var selectFromAsciiNames = document.getElementsByClassName("menu-select")[0];
var errorMsgForAsciiName = document.getElementsByClassName("ascii-error")[0];
let asciiName;


function sendRequest(url, options, successCallback, errorCallback) {
    var request = new XMLHttpRequest();

    request.onload = function () {
        var response = JSON.parse(request.responseText);
        if (request.status === 200) {
            successCallback(response);
        } else {
            console.log('Not authorized')
            errorCallback(response);
        }
    }
    request.open(options.method, url, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send(options.data);
}

// STORE MATRIX TEXT

let asciiSymbols = [];
let asciiText;

function drawCells() {

    for (i = 0; i < document.getElementById("drawer").height; i += CELL_SIZE) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(document.getElementById("drawer").width, i);
        context.lineWidth = 0.05;
        context.stroke();
    }
    for (i = 0; i < document.getElementById("drawer").width; i += CELL_SIZE) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, document.getElementById("drawer").height);
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
        canvas.classList.remove("delete-symbol");
    });
}

function chooseCharacter() {
    for (let i = 0; i < letters.length; ++i) {
        letters[i].addEventListener("click", function () {
            chosenSymbol = letters[i].textContent;
            document.getElementsByClassName("letter-btn")[0].innerHTML = chosenSymbol;
            document.getElementsByClassName("letters")[0].classList.toggle("open");
        });
    }
}

function setColors() {
    document.getElementById("color").addEventListener("change", function (e) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        chosenColor = e.target.value;
        for (let i = 0; i < 10000; ++i) {
            context.fillStyle = chosenColor;
            if (asciiSymbols[i] && asciiSymbols[i].x && asciiSymbols[i].y) {
                context.fillText(chosenSymbol, asciiSymbols[i].x, asciiSymbols[i].y);
            }
        }
    })
}

function clearSymbols() {
    document.getElementsByClassName("clear-symbols")[0].addEventListener("click", function () {
        canvas.classList.add("delete-symbol");
    });
}

function clickButtonForFillingColor() {
    if (document.getElementsByClassName("chosen-letter")[0]) {
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

function changeAsciiName() {
    document.getElementById("ascii-name").addEventListener('change', function (event) {
        asciiName = event.target.value;
    });
}

function addOptionsToSelect(response) {
    if (response[0]) {
        let rows = response[0];
        for (let i = 0; i < rows.length; ++i) {
            selectFromAsciiNames.options[selectFromAsciiNames.options.length] = new Option(rows[i].name, rows[i].name);
        }
    }
}

function loadAllAsciiPictures() {
    var data = {};
    // TODO: get the id of the current user
    data['owner_id'] = 1;
    sendRequest('../../server/page_controllers/ascii-editor/get-ascii-names.php', { method: 'POST', data: `data=${JSON.stringify(data)}` }, addOptionsToSelect, handleErrorAddAscii);
}

// call functions after DOM is loaded
document.addEventListener("DOMContentLoaded", function (event) {
    loadAllAsciiPictures();
    changeAsciiName();
    drawCells();
    addAsciiCharacters();
    toggleAsciiCharacters();
    chooseCharacter();
    setColors();
    clickButtonForFillingColor();
    floodFill(event.pageX, event.pageY);
    saveAsciiPicture();
    clearSymbols();
});

window.addEventListener("load", () => {
    drawCells();
    resize();
    canvas.addEventListener("mousedown", startPainting);
    canvas.addEventListener("mouseup", stopPainting);
    canvas.addEventListener("mousemove", sketch);
    window.addEventListener('resize', resize);
})

function resize() {
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
}

let isStartedPainting = false;
let arrayFromUsedPoints = [];

function transformCoordinates(x, y) {
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
    return { newX, newY };
}

function startPainting(event) {
    let numberOfColumns = Math.floor(document.getElementById("drawer").width / CELL_SIZE);
    if (isFilling) return;
    let { newX, newY } = transformCoordinates(event.offsetX, event.offsetY);
    context.font = "20px sans-serif";
    if (!canvas.classList.contains("delete-symbol")) {
        context.fillStyle = chosenColor;
        // asciiSymbols[(newY / 20) * numberOfColumns + (newX / 20)] = chosenSymbol;
        // asciiSymbols.push({x: newX, y: newY, symbol: chosenSymbol});
        asciiSymbols[(newY / 20) * numberOfColumns + (newX / 20)] = { x: newX, y: newY, symbol: chosenSymbol };
        if(newY / 20 < minRow) {
            minRow = (newY / 20);
        }
        if(newY / 20 > minRow) {
            maxRow = (newY / 20);
        }
        if(newX / 20 < minCol) {
            minCol = (newX / 20);
        }
        if(newX / 20 > maxCol) {
            maxCol = (newX / 20);
        }
        console.log("x: " + newX);
        console.log("y: " + newY);
        context.fillText(chosenSymbol, newX, newY);
        arrayFromUsedPoints.push({ x: newX, y: newY });
    } else {
        context.rect(newX, newY, 20, 20);
        context.fillStyle = "#ECF0F1";
        context.fill();
        asciiSymbols[(newY / 20) * numberOfColumns + (newX / 20)] = {
            'hasBackground': false,
            'symbol': '',
            'color': ''
        };
    }
    isStartedPainting = true;
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
    let numberOfColumns = Math.floor(document.getElementById("drawer").width / CELL_SIZE);
    if (!isStartedPainting) return;
    if (isFilling) return;
    context.beginPath();

    // FONT SIZE AND SIZE OF CELLS: 20PX
    currentPoint = { x: event.offsetX, y: event.offsetY };
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
        if (!canvas.classList.contains("delete-symbol")) {
            context.fillStyle = chosenColor;
            context.fillText(chosenSymbol, currentPoint.x, currentPoint.y);
            // asciiSymbols[(currentPoint.y/ 20) * numberOfColumns + (currentPoint.x/ 20)] = chosenSymbol;
            // asciiSymbols.push({x: currentPoint.x, y: currentPoint.y, symbol: chosenSymbol});
            if(currentPoint.y / 20 < minRow) {
                minRow = (currentPoint.y/ 20);
            }
            if(currentPoint.y / 20 > minRow) {
                maxRow = (currentPoint.y / 20);
            }
            if(currentPoint.x / 20 < minCol) {
                minCol = (currentPoint.x / 20);
            }
            if(currentPoint.x / 20 > maxCol) {
                maxCol = (currentPoint.x / 20);
            }
            asciiSymbols[(currentPoint.y / 20) * numberOfColumns + (currentPoint.x / 20)] = { x: currentPoint.x, y: currentPoint.y, symbol: chosenSymbol };
        } else {
            context.rect(currentPoint.x, currentPoint.y, 20, 20);
            context.fillStyle = "#ECF0F1";
            context.fill();
        }
    }
}

function isValidCoordinates(x, y) {
    if (x < 0 || y < 0) {
        return false;
    }
    if (x > document.getElementById("drawer").width || y > document.getElementById("drawer").height) {
        return false;
    }
}

function fillCanvas(x, y) {
    if (!isValidCoordinates(x, y)) {
        return;
    }

    fillCanvas(x + 1, y);
    fillCanvas(x - 1, y);
    fillCanvas(x, y + 1);
    fillCanvas(x, y - 1);
}

function floodFill(x, y) {
    if (!isFilling) {
        fillCanvas(x, y);
    }
}

function saveAsciiPicture() {
    var data = {};
    document.getElementsByClassName("ascii-form")[0].addEventListener("submit", function (event) {
        let result = "";
        for (let i = minRow * Math.floor(canvas.width / CELL_SIZE)  + minCol; i < maxRow * Math.floor(canvas.width / CELL_SIZE) + maxCol; ++i) {
            if (asciiSymbols[i] && asciiSymbols[i].symbol) {
                result += asciiSymbols[i].symbol;
            } else {
                result += ' ';
            }
        }
        asciiText = result;
        data['value'] = asciiText.trim();
        data['name'] = asciiName;
        data['color'] = chosenColor;
        event.preventDefault();
        sendRequest('../../server/page_controllers/ascii-editor/add-ascii-picture.php', { method: 'POST', data: `data=${JSON.stringify(data)}` }, refreshAsciiEditor, handleErrorAddAscii);
    });
}

function refreshAsciiEditor(response) {
    if (response["success"]) {
        errorMsgForAsciiName.style.display = "none";
        //   window.location.assign("editor.html");
    } else {
        if (response["errors"]) {
            errorMsgForAsciiName.style.display = "block";
            errorMsgForAsciiName.innerHTML = "Ascii picture with this name already exists";
        } else {
            errorMsgForAsciiName.style.display = "none";
        }
    }
}

function handleErrorAddAscii(response) {
    console.log(response);
    if (response["errors"]) {
        //   errorMsgForLogin.style.display = "block";
        //   errorMsgForLogin.innerHTML = "A user with this username already exists.";
    } else {
        console.log("error");
        //   errorMsgForLogin.style.display = "none";
    }
}
