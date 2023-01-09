window.onload = function () {
    getUserInfo();
};

const baseUrl = 'http://localhost:80/project-web-2022/ASCII-Art/server/page_controllers/users/userInfo.php';
function getUserInfo() {
    sessionStorage.setItem('user', 2);
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const userId = urlParams.get('user');
    var url = baseUrl + '?user=' + userId;
    sessionStorage.setItem('user', userId);
    sendRequest(url, { method: 'GET', data: '' }, handleUserInfo, handleErrorUserInfo);
}



function handleUserInfo(response) {
    var userNameEl = document.getElementById('username');
    userNameEl.innerHTML = response['user']['username'];
    getAllAsciiPictures(response['user']['id']);
}

function handleErrorUserInfo(response) {
    errorMsg.style.display = "block";
    errorMsg.innerHTML = response['error_message'];
}


var wrapper = document.getElementsByClassName("wrapper")[0];
function sendRequest(url, options, successCallback, errorCallback) {
    var request = new XMLHttpRequest();
    console.log(url);
    request.onload = function () {
        console.log(url);
        console.log(request.responseText);
        var response = JSON.parse(request.responseText);
        if (request.status === 200 && response['success']) {
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
        `http://localhost:80/project-web-2022/ASCII-Art/server/page_controllers/ascii-editor/getAllPictures.php?owner=${ownerId}&&user=${sessionStorage.getItem('user')}`,
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
    if (response["success"] && response['pictures']) {
        var wrapper = document.getElementsByClassName("wrapper")[0];
        for (let currentAscii of response['pictures']) {
            let asciiPicture = currentAscii['data'];
            let isLiked = currentAscii['liked'];
            let likesCount = currentAscii['likes_count'];
            showAsciiPicture(wrapper, asciiPicture, isLiked, likesCount);
        }
    } else {
        // show error message
    }
}


// element => html element; asciiText => value attribute from PICTURES sql table
function showAsciiPicture(element, asciiPicture, isLiked, likesCount) {
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
        addLikeButton(element, asciiPicture['id'], isLiked, likesCount);
    }
}

function handleError(response) {
    console.log(response);
}


const USER_ID = 2;
const ASCII_NAME = "1";
const PAGINATION_PAGE = 0;
const PAGINATION_PAGESIZE = 10;

document.addEventListener("DOMContentLoaded", function (event) {
    // getAsciiText(USER_ID,ASCII_NAME); // get one ascii picture
    // getAllAsciiPictures(sessionStorage.getItem('user')); // get all ascii pictures
    // getAllFriendsPictures(USER_ID, PAGINATION_PAGE, PAGINATION_PAGESIZE); // get all friends ascii pictures with pagination
});




function addLikeButton(el, pictureId, isLiked, likesCount) {
    let button = document.createElement('a');

    button.className = "button button-like";
    let i = document.createElement('i');
    i.classList.add('fa');
    i.classList.add('fa-heart');
    button.appendChild(i);
    let span = document.createElement('span');
    span.innerHTML = 'Like';
    let likesCountEl = document.createElement('span');
    likesCountEl.innerHTML = likesCount;
    likesCountEl.className = 'counter';
    let likedEl = document.createElement('span');
    likedEl.innerHTML = isLiked;
    likedEl.className = 'liked';
    likedEl.hidden = true;
    button.appendChild(span);
    button.appendChild(likesCountEl);
    button.appendChild(likedEl);
    button.addEventListener("click", function (e) {
        changeButtonView(button, pictureId);
        refreshCounter(button);
    });
    if (isLiked) {
        makeButtonLiked(button);
    }
    el.appendChild(button);
}


function addLike(pictureId) {
    var data = { 'user': sessionStorage.getItem('user'), 'picture': pictureId };
    sendRequest(`http://localhost:80/project-web-2022/ASCII-Art/server/page_controllers/feed/likes.php`,
        { method: "POST", data: JSON.stringify(data) },
        () => { },
        handleError,
    );
}

function deleteLike(pictureId) {
    var data = { 'user': sessionStorage.getItem('user'), 'picture': pictureId };
    sendRequest(`http://localhost:80/project-web-2022/ASCII-Art/server/page_controllers/feed/likes.php`,
        { method: "DELETE", data: JSON.stringify(data) },
        () => { },
        handleError,
    );
}

function makeButtonLiked(button) {
    button.style.color = 'green';
    button.style.fontWeight = 'bold';
    button.style.borderWidth = 'thick ';
    button.style.borderColor = 'green';
}

function makeButtonNotLiked(button) {
    button.style.color = 'grey';
    button.style.fontWeight = 'thin';
    button.style.borderWidth = 'thin';
    button.style.borderColor = 'grey';
}

function changeButtonView(button, pictureId) {
   console.log( button.getElementsByClassName('liked')[0]);
    let isLiked = button.getElementsByClassName('liked')[0].innerHTML;

    if (isLiked == 'true') {
        makeButtonNotLiked(button);
        deleteLike(pictureId);
        return;
    }
    makeButtonLiked(button);
    addLike(pictureId);
}

function refreshCounter(button) {
    let likesCount =parseInt(button.getElementsByClassName('counter')[0].innerHTML);
    console.log(likesCount);
    let isLiked = button.getElementsByClassName('liked')[0].innerHTML;
    if (isLiked == 'true') {
        likesCount -= 1;
        button.getElementsByClassName('liked')[0].innerHTML =false;
    }
    else {
        likesCount += 1;
        button.getElementsByClassName('liked')[0].innerHTML =true;
    }
    button.getElementsByClassName('counter')[0].innerHTML = likesCount;
}