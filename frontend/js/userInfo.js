window.onload = function () {
    getUserInfo();
};

const baseUrl = 'http://localhost:80/project-web-2022/ASCII-Art/server/page_controllers/userInfo.php';
function getUserInfo() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const userId = urlParams.get('user');
    var url = baseUrl + '?user=' + userId;
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