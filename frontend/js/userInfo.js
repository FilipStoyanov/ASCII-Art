window.onload = function () {
    getUserInfo();
};

const baseUrl = 'http://localhost:80/project-web-2022/ASCII-Art/server/page_controllers/userInfo.php';
function getUserInfo() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const userId = urlParams.get('user');
    var url = baseUrl + '?user=' + userId;
    sessionStorage.setItem('user', userId);
    sendRequest(url, { method: 'GET', data: '' }, handleUserInfo, handleErrorUserInfo);
}


function sendRequest(url, options, successCallback, errorCallback) {
    var request = new XMLHttpRequest();

    request.onload = function () {
        console.log('raw body: ' + request.responseText);
        var response = JSON.parse(request.responseText);
        console.log(response);
        if (request.status === 200 && response['success']) {
            successCallback(response);
        } else {
            console.log('Not authorized')
            errorCallback(response);
        }
    }

    request.open(options.method, url, false);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(options.data);
}

function handleUserInfo(response) {
    var userNameEl = document.getElementById('username');
    userNameEl.innerHTML = response['user']['username'];
}

function handleErrorUserInfo(response) {
    errorMsg.style.display = "block";
    errorMsg.innerHTML = response['error_message'];
}


var wrapper = document.getElementsByClassName("wrapper")[0];
function sendRequest(url, options, successCallback, errorCallback) {
    var request = new XMLHttpRequest();
    request.onload = function () {
        console.log(url);
        console.log(request.responseText);
        var response = JSON.parse(request.responseText);
        if (request.status === 200) {
            successCallback(response);
        } else {
            console.log("Not authorized");
            errorCallback(response);
        }
    };
    request.open(options.method, url, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(options.data);
}


// get one ascii picture by owner_id and name
function getAsciiText(ownerId, name) {
    sendRequest(
        `http://localhost:80/project-web-2022/ASCII-Art/server/page_controllers/ascii-editor/getAsciiPicture.php?user=${ownerId}&name=${name}`,
        { method: "GET", data: '' },
        displayAsciiPictures,
        handleError,
    );
}

// get all ascii pictures by owner_id
function getAllAsciiPictures(ownerId) {
    sendRequest(
        `http://localhost:80/project-web-2022/ASCII-Art/server/page_controllers/ascii-editor/getAllPictures.php?user=${ownerId}`,
        { method: "GET", data: '' },
        displayAsciiPictures,
        handleError,
    );
}

// get all friends' ascii pictures
function getAllFriendsPictures(ownerId, page, pageSize) {
    sendRequest(
        `../../server/page_controllers/ascii-editor/getAllFriendsPictures.php?user=${ownerId}&page=${page}&pageSize=${pageSize}`,
        { method: "GET", data: '' },
        displayAsciiPictures,
        handleError,
    );
}

function displayAsciiPictures(response) {
    console.log('azzzzzzzzzzzzzzzzzzz');
    if (response["success"] && response[0]) {
        var wrapper = document.getElementsByClassName("wrapper")[0];
        for (let currentAscii of response[0]) {
            console.log(currentAscii);
            let asciiPicture = currentAscii;
            showAsciiPicture(wrapper, asciiPicture);
        }
    } else {
        // show error message
    }
}


// element => html element; asciiText => value attribute from PICTURES sql table
function showAsciiPicture(element, asciiPicture) {
    if (element && asciiPicture) {
        let responseAsciiValue = asciiPicture.value;
        let asciiColor = asciiPicture.color;
        let asciiText = responseAsciiValue.substring(1, responseAsciiValue.length - 1).replace(/\\n/g, '<br/>');
        asciiText = asciiText.replace('<br/>', '');
        let asciiWrapperElement = document.createElement('div');
        asciiWrapperElement.className = "ascii-wrapper";
        asciiWrapperElement.style.backgroundColor = 'white';
        let asciiTextElement = document.createElement("pre");
        asciiTextElement.className = "ascii-picture";
        asciiTextElement.style.color = asciiColor;
        asciiTextElement.innerHTML = asciiText;
        asciiWrapperElement.appendChild(asciiTextElement);
        element.appendChild(asciiWrapperElement);
        addLikeButton(element);
    }
}

function handleError() {

}


const USER_ID = 2;
const ASCII_NAME = "1";
const PAGINATION_PAGE = 0;
const PAGINATION_PAGESIZE = 10;

document.addEventListener("DOMContentLoaded", function (event) {
    // getAsciiText(USER_ID,ASCII_NAME); // get one ascii picture
    getAllAsciiPictures(sessionStorage.getItem('user')); // get all ascii pictures
    // getAllFriendsPictures(USER_ID, PAGINATION_PAGE, PAGINATION_PAGESIZE); // get all friends ascii pictures with pagination
});




function addLikeButton(el) {
    let button = document.createElement('a');

    button.className = "button button-like";
    let i = document.createElement('i');
    i.classList.add('fa');
    i.classList.add('fa-heart');
    button.appendChild(i);
    let span = document.createElement('span');
    span.innerHTML = 'Like';
    button.appendChild(span);
    button.addEventListener("click", function (e) {
        makeButtonLiked(button);
        addLike();
        refreshCounter();
        console.log('LIKED');
    });

    el.appendChild(button);
}


function addLike() {

}

function makeButtonLiked(button) {
    button.style.color = 'green';
    button.style.fontWeight = 'bold';
    button.style.borderWidth = 'thick ';
    button.style.borderColor = 'green';
}