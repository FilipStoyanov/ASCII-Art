const BASE_URL = "../../server/page_controllers/ascii-editor/";
var canvas = document.querySelector("#drawer");
var context = canvas.getContext("2d");
let CELL_SIZE = 20;
var toggleButtonForAsciiLetters = document.getElementById("letter-btn");
var letters = document.getElementsByClassName("letter");
let chosenSymbol = "x";
let chosenColor = "#000000";
let isFilling = false;
var drawField = document.getElementsByClassName("draw-field")[0];
var toggleButtonForColors = document.getElementsByClassName("color-btn")[0];
var selectFromAsciiNames = document.getElementsByClassName("menu-select")[0];
var deleteBtn = document.getElementsByClassName("delete-ascii")[0];
var pageUrl = new URL(window.location.href);

var updateNameInput = document.getElementById("name-update");
var selectedAsciiFile;
var asciiName;
var fontSize = 20;
var numberOfColumns, numberOfRows;
var previousCanvasWidth;

// MODAL
var modal = document.getElementById("modal");
var modalContent = document.getElementsByClassName("modal-body")[0];
var modalCloseBtn = document.getElementsByClassName("close")[0];


function modalFunctionality() {
  modalCloseBtn.onclick = function () {
    document.getElementsByClassName("editor")[0].classList.remove("show-modal");
    if(document.getElementsByClassName("modal")[0].classList.contains("delete")) {
       window.location.reload();
    }
  };

  window.onclick = function (event) {
    console.log(document.getElementsByClassName("modal")[0].classList.contains("delete"));
    if (event.target == modal) {
      document
        .getElementsByClassName("editor")[0]
        .classList.remove("show-modal");
        if(document.getElementsByClassName("modal")[0].classList.contains("delete")) {
          window.location.reload();
        }
    }
  };
}

// STORE MATRIX TEXT
let asciiSymbols = [];
let asciiText;

// from ascii code 32 to 126
function addAsciiCharacters() {
  const START_ASCII_CODE = 32;
  const FINISH_ASCII_CODE = 126;
  const START_ASCII_CODE_SECOND = 160;
  const FINISH_ASCII_CODE_SECOND = 885;
  let letters = document.getElementsByClassName("letters")[0];
  for (let i = START_ASCII_CODE; i < FINISH_ASCII_CODE; ++i) {
    let character = String.fromCharCode(i);
    if (character != " ") {
      let letter = document.createElement("button");
      letter.classList.add("letter");
      letter.innerHTML = String.fromCharCode(i);
      letters.appendChild(letter);
    }
  }

  for (let i = START_ASCII_CODE_SECOND; i < FINISH_ASCII_CODE_SECOND; ++i) {
    let character = String.fromCharCode(i);
    if (character != " ") {
      let letter = document.createElement("button");
      letter.classList.add("letter");
      letter.innerHTML = String.fromCharCode(i);
      letters.appendChild(letter);
    }
  }
}

function toggleAsciiCharacters() {
  toggleButtonForAsciiLetters.addEventListener("click", function () {
    drawField.style.cursor = "crosshair";
    isFilling = false;
    document.getElementsByClassName("letters")[0].classList.toggle("open");
    canvas.classList.remove("delete-symbol");
  });
}

function chooseCharacter() {
  for (let i = 0; i < letters.length; ++i) {
    letters[i].addEventListener("click", function () {
      chosenSymbol = letters[i].textContent;
      toggleButtonForAsciiLetters.innerHTML = `Character <span class="selected-ascii">${chosenSymbol}</span>`;
      document.getElementsByClassName("letters")[0].classList.toggle("open");
    });
  }
}

function closePopupMenus() {
  document.addEventListener("click", function (event) {
    if (
      event.target.classList.contains("character-btn") ||
      event.target.classList.contains("selected-ascii")
    ) {
      if (
        document.getElementsByClassName("letters")[0].classList.contains("open")
      ) {
        document.getElementsByClassName("letters")[0].classList.add("open");
      } else {
        document.getElementsByClassName("letters")[0].classList.remove("open");
      }
      canvas.classList.remove("delete-symbol");
    } else {
      document.getElementsByClassName("letters")[0].classList.remove("open");
    }
  });
}

function setColors() {
  document.getElementById("color").addEventListener("change", function (e) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    chosenColor = e.target.value;
    redrawAsciiPicture();
  });
}

function clearSymbols() {
  document
    .getElementsByClassName("clear-symbols")[0]
    .addEventListener("click", function () {
      canvas.classList.add("delete-symbol");
      drawField.style.cursor = "cell";
      isFilling = false;
    });
}

function clickButtonForFillingColor() {
  if (toggleButtonForAsciiLetters) {
    toggleButtonForAsciiLetters.addEventListener("click", function () {
      drawField.style.cursor = "crosshair";
      isFilling = false;
    });
  }
  toggleButtonForColors.addEventListener("click", function () {
    document.getElementById("color").click();
    drawField.style.cursor = "crosshair";
    isFilling = false;
  });
  document
    .getElementsByClassName("fill-btn")[0]
    .addEventListener("click", function () {
      drawField.style.cursor = "default";
      isFilling = true;
    });
}

function changeAsciiName() {
  document
    .getElementById("ascii-name")
    .addEventListener("change", function (event) {
      asciiName = event.target.value;
    });
  document
    .getElementById("name-update")
    .addEventListener("change", function (event) {
      asciiName = event.target.value;
    });
}

function addOptionsToSelect(response) {
  if (response[0]) {
    let rows = response[0];
    for (let i = 0; i < rows.length; ++i) {
      selectFromAsciiNames.options[selectFromAsciiNames.options.length] =
        new Option(rows[i].name, rows[i].name);
    }
    const url = window.location.href;
    const urlObj = new URL(url);
    let search, searchParams;
    if (urlObj && urlObj.search) {
      search = urlObj.search.substring(1);
      searchParams = JSON.parse(
        '{"' +
        decodeURI(search)
          .replace(/"/g, '\\"')
          .replace(/&/g, '","')
          .replace(/=/g, '":"') +
        '"}'
      );
      if (searchParams && searchParams["ascii-name"]) {
        const option = Array.from(selectFromAsciiNames.options).find(
          (option) => option.value === searchParams["ascii-name"]
        );
        option.selected = true;
      }
    }
  }
}

function selectOptionFromFileNames() {
  if (selectFromAsciiNames) {
    selectFromAsciiNames.addEventListener("change", function (event) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      selectedAsciiFile = event.target.value;
      asciiSymbols = [];
      if (selectedAsciiFile) {
        updateSearchParams(event.target.value);
        document
          .getElementsByClassName("editor-menu")[0]
          .classList.add("update-ascii");
        getAsciiPicture(selectedAsciiFile);
        updateNameInput.value = selectedAsciiFile;
        asciiName = selectedAsciiFile;
      } else {
        deleteSearchParams();
        document
          .getElementsByClassName("editor-menu")[0]
          .classList.remove("update-ascii");
      }
    });
  }
}

function handleRemoveAsciiPicture() {
  deleteBtn.addEventListener("click", function () {
    removeAsciiPicture(selectFromAsciiNames.value);
  });
}

function removeAsciiPicture(name) {
  const jwtToken = getCookie("token");
  const userId = getUserIdFromJwtToken();
  if (userId && jwtToken) {
    const data = {};
    data["owner_id"] = userId;
    data["name"] = name;
    sendRequest(
      `${BASE_URL}deleteAsciiPicture.php`,
      { method: "DELETE", data: JSON.stringify(data), token: jwtToken },
      deleteAsciiPicture,
      handleErrorAscii
    );
  }
}

function deleteAsciiPicture(response) {
  showModalForSeconds(true);
  document.getElementsByClassName("modal")[0].classList.add("delete");
  if (response["success"]) {
    deleteSearchParams();
    document.getElementsByClassName("modal-header")[0].style.backgroundColor =
      "#4BB543";
    document.getElementsByClassName("modal-footer")[0].style.backgroundColor =
      "#4BB543";
    modalContent.innerHTML = "Your Ascii Picture was deleted successfully.";
  } else {
    document.getElementsByClassName("modal-header")[0].style.backgroundColor =
      "#FF0000";
    document.getElementsByClassName("modal-footer")[0].style.backgroundColor =
      "#FF0000";
    modalContent.innerHTML =
      "An error has occurred while deleting the Ascii Picture. Try again.";
  }
}

function getAsciiPicture(value) {
  const jwtToken = getCookie("token");
  const userId = getUserIdFromJwtToken();
  if (userId && jwtToken) {
    const data = {};
    data["owner_id"] = userId;
    data["name"] = value;
    sendRequest(
      `${BASE_URL}getAsciiPicture.php?user=${data["owner_id"]}&name=${data["name"]}`,
      { method: "GET", data: "", token: jwtToken },
      loadAsciiPicture,
      handleErrorAscii
    );
  }
}

function redrawAsciiPicture(color = chosenColor) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = color;
  for (let i = 0; i < asciiSymbols.length; ++i) {
    if (asciiSymbols[i] && asciiSymbols[i].symbol) {
      context.fillText(
        asciiSymbols[i].symbol,
        asciiSymbols[i].x,
        asciiSymbols[i].y
      );
    }
  }
}

function loadAsciiPicture(response) {
  document.getElementById("color").value = response[0][0].color;
  chosenColor = response[0][0].color;
  const START_X = 0;
  const START_Y = 0;
  let currentX, currentY;
  let lines = response[0][0].value
    .substring(0, response[0][0].value.length - 1)
    .split("\\n");
  let color = response[0][0].color;
  context.fillStyle = color;
  currentY = START_Y;
  let asciiCounter = 0;
  for (let i = 0; i < lines.length; ++i) {
    currentX = START_X;
    for (let j = 0; j < lines[i].length; ++j) {
      context.fillText(lines[i][j], currentX, currentY);
      asciiSymbols[
        (currentY / CELL_SIZE) * numberOfColumns + currentX / CELL_SIZE
      ] = {
        x: currentX,
        y: currentY,
        symbol: lines[i][j],
      };
      currentX += CELL_SIZE;
      ++asciiCounter;
    }
    currentY += CELL_SIZE;
  }
}

function loadAllAsciiPictures() {
  const jwtToken = getCookie("token");
  const userId = getUserIdFromJwtToken();
  if (userId && jwtToken) {
    sendRequest(
      `${BASE_URL}getAsciiNames.php?user=${userId}`,
      { method: "GET", data: "", token: jwtToken },
      addOptionsToSelect,
      handleErrorAscii
    );
  }
}

function loadCurrentAsciiPicture() {
  const url = window.location.href;
  const urlObj = new URL(url);
  let search, searchParams;
  if (urlObj && urlObj.search) {
    search = urlObj.search.substring(1);
    searchParams = JSON.parse(
      '{"' +
      decodeURI(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"') +
      '"}'
    );
  }
  if (searchParams && searchParams["ascii-name"]) {
    getAsciiPicture(searchParams["ascii-name"]);
    document
      .getElementsByClassName("editor-menu")[0]
      .classList.add("update-ascii");
    updateNameInput.value = searchParams["ascii-name"];
    asciiName = selectedAsciiFile;
  }
}

// call functions after DOM is loaded
document.addEventListener("DOMContentLoaded", function (event) {
  selectOptionFromFileNames();
  loadAllAsciiPictures();
  loadCurrentAsciiPicture();
  changeAsciiName();
  addAsciiCharacters();
  toggleAsciiCharacters();
  chooseCharacter();
  setColors();
  clickButtonForFillingColor();
  saveAsciiPicture();
  clearSymbols();
  handleRemoveAsciiPicture();
  closePopupMenus();
  updateAsciiPicture();
  modalFunctionality();
});

window.addEventListener("load", () => {
  previousCanvasWidth = window.innerWidth;
  resize();
  initializeMatrix();
  canvas.addEventListener("mousedown", startPainting);
  canvas.addEventListener("mouseup", stopPainting);
  canvas.addEventListener("mousemove", sketch);
  window.addEventListener("resize", resize);
});

function initializeDimensions() {
  if (window.innerWidth >= 1200) {
    context.canvas.width = window.innerWidth * 0.75;
    context.canvas.height = window.innerHeight;
  } else {
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
  }
  if (context.canvas.width < 1160 && context.canvas.width >= 600) {
    fontSize = Math.floor((context.canvas.width / 1160) * 20);
    CELL_SIZE = Math.floor((context.canvas.width / 1160) * 20);
  } else if (context.canvas.width >= 1160) {
    CELL_SIZE = 20;
    fontSize = 20;
  }
  numberOfColumns = Math.floor(context.canvas.width / CELL_SIZE);
  numberOfRows = Math.floor(canvas.height / CELL_SIZE);
}

function initializeMatrix() {
  for (let i = 0; i < numberOfColumns * numberOfRows; ++i) {
    asciiSymbols[i] = {
      x: (i % numberOfColumns) * CELL_SIZE,
      y: Math.floor(i / numberOfColumns) * CELL_SIZE,
      symbol: " ",
    };
  }
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function updateOnResizeAsciiSymbolsArr() {
  let newAsciiSymbolsArr = [];
  for (let i = 0; i < asciiSymbols.length; ++i) {
    if (asciiSymbols[i]) {
      const { newX, newY } = transformCoordinates(
        Math.floor(
          (context.canvas.width / previousCanvasWidth) * asciiSymbols[i].x
        ),
        asciiSymbols[i].y
      );
      newAsciiSymbolsArr[
        Math.floor(
          (asciiSymbols[i].y / CELL_SIZE) * numberOfColumns +
          asciiSymbols[i].x / CELL_SIZE
        )
      ] = { x: newX, y: newY, symbol: asciiSymbols[i].symbol };
    }
  }
  previousCanvasWidth = context.canvas.width;
  asciiSymbols = [...newAsciiSymbolsArr];
}

function resize() {
  initializeDimensions();
  if (context.canvas.width < 1160 && context.canvas.width >= 600) {
    fontSize = Math.floor((context.canvas.width / 1160) * 20);
    CELL_SIZE = Math.floor((context.canvas.width / 1160) * 20);
  } else if (context.canvas.width >= 1160) {
    CELL_SIZE = 20;
    fontSize = 20;
  }
  updateOnResizeAsciiSymbolsArr();
  context.font = `${fontSize}px sans-serif`;
  for (let i = 0; i < asciiSymbols.length; ++i) {
    if (asciiSymbols[i]) {
      context.fillStyle = chosenColor;
      context.fillText(
        asciiSymbols[i].symbol,
        asciiSymbols[i].x,
        asciiSymbols[i].y
      );
    }
  }
}

let isStartedPainting = false;
let arrayFromUsedPoints = [];

function transformCoordinates(x, y) {
  let xRemainder = x % CELL_SIZE;
  let yRemainder = y % CELL_SIZE;
  if (yRemainder <= CELL_SIZE / 2) {
    newY = y - yRemainder;
  } else {
    newY = y + (CELL_SIZE - yRemainder);
  }
  if (xRemainder <= 10) {
    newX = x - xRemainder;
  } else {
    newX = x + (CELL_SIZE - xRemainder);
  }
  return { newX, newY };
}

function startPainting(event) {
  let { newX, newY } = transformCoordinates(event.offsetX, event.offsetY);
  let prevSymbol = " ";
  let visited = [];
  if (isFilling) {
    fillCanvasUtil(
      asciiSymbols,
      newX / CELL_SIZE,
      newY / CELL_SIZE,
      prevSymbol,
      chosenSymbol,
      visited,
      0
    );
    return;
  }
  context.font = `${fontSize}px sans-serif`;
  if (!canvas.classList.contains("delete-symbol")) {
    context.fillStyle = chosenColor;
    asciiSymbols[
      Math.floor((newY / CELL_SIZE) * numberOfColumns + newX / CELL_SIZE)
    ] = { x: newX, y: newY, symbol: chosenSymbol };
    context.fillText(chosenSymbol, newX, newY);
    arrayFromUsedPoints.push({ x: newX, y: newY });
    asciiSymbols[
      Math.floor((newY / CELL_SIZE) * numberOfColumns + newX / CELL_SIZE)
    ] = { x: newX, y: newY, symbol: chosenSymbol };
  } else {
    asciiSymbols[
      Math.floor((newY / CELL_SIZE) * numberOfColumns + newX / CELL_SIZE)
    ] = {
      x: newX,
      y: newY,
      symbol: " ",
    };
    redrawAsciiPicture();
  }
  isStartedPainting = true;
}

function stopPainting() {
  isStartedPainting = false;
}

function hasPointAtCoordinates(point) {
  for (let i = 0; i < arrayFromUsedPoints.length; ++i) {
    if (
      Math.abs(arrayFromUsedPoints[i].x - point.x) <= CELL_SIZE / 2 &&
      Math.abs(arrayFromUsedPoints[i].y - point.y) <= CELL_SIZE / 2
    ) {
      return true;
    }
  }
  return false;
}

function sketch(event) {
  if (!isStartedPainting) return;
  if (isFilling) return;
  context.beginPath();

  currentPoint = { x: event.offsetX, y: event.offsetY };
  skipThisPoint = hasPointAtCoordinates(currentPoint);
  arrayFromUsedPoints.push(currentPoint);

  let xRemainder = Math.floor(currentPoint.x) % CELL_SIZE;
  let yRemainder = Math.floor(currentPoint.y) % CELL_SIZE;
  if (xRemainder <= CELL_SIZE / 2) {
    currentPoint.x -= xRemainder;
  } else {
    currentPoint.x += CELL_SIZE - xRemainder;
  }
  if (yRemainder <= CELL_SIZE / 2) {
    currentPoint.y -= yRemainder;
  } else {
    currentPoint.y += CELL_SIZE - yRemainder;
  }
  if (context.canvas.width < 1160 && context.canvas.width >= 600) {
    fontSize = Math.floor((context.canvas.width / 1160) * 20);
    CELL_SIZE = Math.floor((context.canvas.width / 1160) * 20);
  } else if (context.canvas.width >= 1160) {
    CELL_SIZE = 20;
    fontSize = 20;
  }
  context.font = `${fontSize}px sans-serif`;
  if (!skipThisPoint && !canvas.classList.contains("delete-symbol")) {
    context.fillStyle = chosenColor;
    context.fillText(chosenSymbol, currentPoint.x, currentPoint.y);
    asciiSymbols[
      Math.floor(
        (currentPoint.y / CELL_SIZE) * numberOfColumns +
        currentPoint.x / CELL_SIZE
      )
    ] = { x: currentPoint.x, y: currentPoint.y, symbol: chosenSymbol };
  } else if (canvas.classList.contains("delete-symbol")) {
    if (
      asciiSymbols[
      Math.floor(
        (currentPoint.y / CELL_SIZE) * numberOfColumns +
        currentPoint.x / CELL_SIZE
      )
      ] &&
      asciiSymbols[
        Math.floor(
          (currentPoint.y / CELL_SIZE) * numberOfColumns +
          currentPoint.x / CELL_SIZE
        )
      ].symbol
    )
      asciiSymbols[
        Math.floor(
          (currentPoint.y / CELL_SIZE) * numberOfColumns +
          currentPoint.x / CELL_SIZE
        )
      ]["symbol"] = " ";
    redrawAsciiPicture();
  }
}

function isValidCoordinates(x, y) {
  if (x <= 0 || y <= 0 || x >= numberOfColumns || y >= numberOfRows) {
    return false;
  }
  return true;
}

function fillCanvasUtil(
  screen,
  x,
  y,
  prevCharacter,
  character,
  visited,
  counter
) {
  if (!isValidCoordinates(x, y)) {
    return;
  }

  const currentAsciiIndex = y * numberOfColumns + x;

  if (
    screen[currentAsciiIndex] &&
    screen[currentAsciiIndex].symbol != prevCharacter
  )
    return;

  context.fillStyle = chosenColor;
  context.fillText(character, x * CELL_SIZE, y * CELL_SIZE);
  screen[currentAsciiIndex] = {
    x: x * CELL_SIZE,
    y: y * CELL_SIZE,
    symbol: character,
  };
  visited.push(currentAsciiIndex);

  fillCanvasUtil(
    screen,
    x - 1,
    y,
    prevCharacter,
    character,
    visited,
    counter + 1
  );
  fillCanvasUtil(
    screen,
    x + 1,
    y,
    prevCharacter,
    character,
    visited,
    counter + 1
  );
  fillCanvasUtil(
    screen,
    x,
    y + 1,
    prevCharacter,
    character,
    visited,
    counter + 1
  );
  fillCanvasUtil(
    screen,
    x,
    y - 1,
    prevCharacter,
    character,
    visited,
    counter + 1
  );
}

function saveAsciiPicture() {
  document
    .getElementsByClassName("ascii-form")[0]
    .addEventListener("submit", function (event) {
      let result = "";
      for (
        let i = 0;
        i <
        numberOfRows * Math.floor(canvas.width / CELL_SIZE) +
        numberOfColumns +
        1;
        ++i
      ) {
        if (i % Math.floor(canvas.width / CELL_SIZE) == 0) {
          result += "\\n";
        }
        if (asciiSymbols[i] && asciiSymbols[i].symbol) {
          result += asciiSymbols[i].symbol;
        } else {
          result += " ";
        }
      }
      asciiText = result;
      const jwtToken = getCookie("token");
      const userId = getUserIdFromJwtToken();
      if (userId && jwtToken) {
        const data = {};
        let asciiWithoutFirstLine = asciiText.split("\\n");
        asciiWithoutFirstLine = asciiWithoutFirstLine.slice(2).join("\\n");
        asciiWithoutFirstLine = "\\n" + asciiWithoutFirstLine;
        data["owner_id"] = userId;
        data["value"] = asciiWithoutFirstLine;
        data["name"] = asciiName;
        data["color"] = chosenColor;
        event.preventDefault();
        sendRequest(
          `${BASE_URL}addAsciiPicture.php`,
          {
            method: "POST",
            data: `data=${JSON.stringify(data)}`,
            token: jwtToken,
          },
          addedSuccessfully,
          handleErrorAscii
        );
      }
    });
}

function updateAsciiPicture() {
  document
    .getElementsByClassName("ascii-name-update")[0]
    .addEventListener("submit", function (event) {
      let result = "";
      for (
        let i = 0;
        i <
        numberOfRows * Math.floor(canvas.width / CELL_SIZE) +
        numberOfColumns +
        1;
        ++i
      ) {
        if (i % Math.floor(canvas.width / CELL_SIZE) == 0 && i > 0) {
          result += "\\n";
        }
        if (asciiSymbols[i] && asciiSymbols[i].symbol) {
          result += asciiSymbols[i].symbol;
        } else {
          result += " ";
        }
      }
      asciiText = result;

      const jwtToken = getCookie("token");
      const userId = getUserIdFromJwtToken();
      if (userId && jwtToken) {
        const data = {};
        let asciiWithoutFirstLine = asciiText.split("\\n");
        asciiWithoutFirstLine = asciiWithoutFirstLine.slice(1).join("\\n");
        asciiWithoutFirstLine = "\\n" + asciiWithoutFirstLine;
        data["owner_id"] = userId;
        data["value"] = asciiWithoutFirstLine;
        data["name"] = updateNameInput.value;
        data["color"] = chosenColor;
        data["previous_name"] =
          document.getElementsByClassName("menu-select")[0].value;
        event.preventDefault();
        sendRequest(
          `${BASE_URL}updateAsciiPicture.php`,
          { method: "PUT", data: JSON.stringify(data), token: jwtToken },
          updatedSuccessfully,
          handleErrorAscii
        );
      }
    });
}

function showModalForSeconds(reload = false) {
  document.getElementsByClassName("editor")[0].classList.add("show-modal");
  setTimeout(() => {
    document.getElementsByClassName("editor")[0].classList.remove("show-modal");
    if (reload) {
      window.location.reload();
    }
  }, 3000);
}

function updateSearchParams(asciiName) {
  pageUrl.searchParams.delete("ascii-name");
  pageUrl.searchParams.append("ascii-name", asciiName);
  window.history.pushState({}, "", pageUrl);
}

function deleteSearchParams() {
  pageUrl.searchParams.delete("ascii-name");
  window.history.pushState({}, "", pageUrl);
}

function updatedSuccessfully(response) {
  showModalForSeconds(true);
  if (response["success"]) {
    updateSearchParams(updateNameInput.value);
    document.getElementsByClassName("modal-header")[0].style.backgroundColor =
      "#4BB543";
    document.getElementsByClassName("modal-footer")[0].style.backgroundColor =
      "#4BB543";
    modalContent.innerHTML = "Your Ascii Picture was changed successfully.";
  } else {
    document.getElementsByClassName("modal-header")[0].style.backgroundColor =
      "#FF0000";
    document.getElementsByClassName("modal-footer")[0].style.backgroundColor =
      "#FF0000";
    modalContent.innerHTML =
      "An error has occurred while updating the Ascii Picture. Try again.";
  }
}

function addedSuccessfully(response) {
  if (response["success"]) {
    showModalForSeconds(true);
    updateSearchParams(response["data"]["name"]);
    document.getElementsByClassName("modal-header")[0].style.backgroundColor =
      "#4BB543";
    document.getElementsByClassName("modal-footer")[0].style.backgroundColor =
      "#4BB543";
    modalContent.innerHTML = "Your Ascii Picture was added successfully.";
  } else {
    if (response["errors"]) {
      if (response["code"] == 1062) {
        showModalForSeconds();
        modalContent.innerHTML =
          "An Ascii Picture with this name already exists. Please, enter a different name and then try again.";
      } else {
        showModalForSeconds();
        modalContent.innerHTML = "An error has occurred. Try again.";
      }
    } else {
      document
        .getElementsByClassName("editor")[0]
        .classList.remove("show-modal");
    }
  }
}

function handleErrorAscii(response) {
  if (response["errors"]) {
    showModalForSeconds();
    modalContent.innerHTML = "An error has occurred. Try again.";
  } else {
    document.getElementsByClassName("editor")[0].classList.remove("show-modal");
  }
}
