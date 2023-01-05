var asciiPicture = document.getElementsByClassName("ascii-picture")[0];
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

function getAsciiText (owner_id, name) {
    var data = {};
    // TODO: get the id of the current user
    data["owner_id"] = owner_id;
    data["name"] = name;
    sendRequest(
        `../../server/page_controllers/ascii-editor/get-ascii-picture.php?user=${data['owner_id']}&name=${data['name']}`,
        { method: "GET", data: '' },
        displayAsciiText,
        handleError,
    );
}

function displayAsciiText (response) {
    if(response["success"] && response[0][0]) {
        let responseAsciiValue = response[0][0].value; 
        let asciiColor = response[0][0].color;
        let asciiText = responseAsciiValue.substring(1,responseAsciiValue.length-1).replace(/\\n/g, '<br/>');
        asciiText = asciiText.replace('<br/>', '')
        asciiPicture.innerHTML = asciiText;
        asciiPicture.style.color = asciiColor;
    } else {
        // show error message
    }
}

function handleError() {

}


let exampleUserId = "1";
let exampleAsciiName = "1";

document.addEventListener("DOMContentLoaded", function (event) {
    getAsciiText(exampleUserId,exampleAsciiName);
});


