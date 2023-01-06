var wrapper = document.getElementsByClassName("wrapper")[0];
function sendRequest(url, options, successCallback, errorCallback) {
    var request = new XMLHttpRequest();
    request.onload = function () {
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
function getAsciiText (ownerId, name) {
    sendRequest(
        `../../server/page_controllers/ascii-editor/getAsciiPicture.php?user=${ownerId}&name=${name}`,
        { method: "GET", data: '' },
        displayAsciiPictures,
        handleError,
    );
}

// get all ascii pictures by owner_id
function getAllAsciiPictures(ownerId) {
    sendRequest(
        `../../server/page_controllers/ascii-editor/getAllPictures.php?user=${ownerId}`,
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
    if(response["success"] && response[0]) {
        for(let currentAscii of response[0]) {
            let asciiPicture = currentAscii;
            showAsciiPicture(wrapper, asciiPicture);
        }
    } else {
        // show error message
    }
}


// element => html element; asciiText => value attribute from PICTURES sql table
function showAsciiPicture (element, asciiPicture) {
    if(element && asciiPicture) {
        let responseAsciiValue = asciiPicture.value; 
        let asciiColor = asciiPicture.color;
        let asciiText = responseAsciiValue.substring(1,responseAsciiValue.length-1).replace(/\\n/g, '<br/>');
        asciiText = asciiText.replace('<br/>', '');
        let asciiWrapperElement = document.createElement('div');
        asciiWrapperElement.className="ascii-wrapper";
        let asciiTextElement = document.createElement("pre");
        asciiTextElement.className = "ascii-picture";
        asciiTextElement.style.color = asciiColor;
        asciiTextElement.innerHTML = asciiText;
        asciiWrapperElement.appendChild(asciiTextElement);
        element.appendChild(asciiWrapperElement);
    }
}

function handleError() {

}


const USER_ID = "1";
const ASCII_NAME = "1";
const PAGINATION_PAGE = 0;
const PAGINATION_PAGESIZE = 10;

document.addEventListener("DOMContentLoaded", function (event) {
    // getAsciiText(USER_ID,ASCII_NAME); // get one ascii picture
    getAllAsciiPictures(USER_ID); // get all ascii pictures
    // getAllFriendsPictures(USER_ID, PAGINATION_PAGE, PAGINATION_PAGESIZE); // get all friends ascii pictures with pagination
});


