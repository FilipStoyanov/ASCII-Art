var baseUrl = 'http://localhost:80/project-web-2022/ASCII-Art/server/page_controllers/';

function handleListFellows(response, type, userId) {
  console.log('type: '.type);
  var tableName = type + '-tb';
  var table = document.getElementById(tableName);
  table.innerHTML = '';
  addHeaders(table);

  console.log(response);
  var followers = response[type];
  console.log(followers);
  if (followers.length == 0) {
    console.log('No users found.')
    // TODO add message on the UI or something else
    return;
  }
  followers.forEach(item => {
    let row = table.insertRow();
    let date = row.insertCell(0);
    date.innerHTML = item.id;
    let name = row.insertCell(1);
    name.innerHTML = item.name;
    let link = row.insertCell(2);
    link.innerHTML = 'There will be a link here.';
    let removeBtn = document.createElement("button");
    removeBtn.innerHTML = "Remove this user from " + type;
    removeBtn.onclick = function () {
      if (type == 'followers') {
        removeFollower(userId, item.id,true);
        return;
      }
      removeFollower(item.id, userId,false);
    };
    let remove = row.insertCell(3);
    remove.appendChild(removeBtn)
  });
}

function handleErrorFollowers(response) {
  var errorMsg = document.getElementById("error-msg");

  // if (response["error_message"]) {

  errorMsg.style.display = "block";
  errorMsg.innerHTML = response['error_message'];
  // } else {
  //   errorMsg.style.display = "none";
  // }
}

function listFellows(searchFollowers) {
  console.log(searchFollowers);
  var id = document.getElementById("user-id");
  var data = { 'user': id.value };
  var url;
  var type='';
  if (searchFollowers) {
    url = baseUrl + 'listFollowers.php';
    type = 'followers';
  } else {
    url = baseUrl + 'listFollowings.php';
    type = 'followings';
  }
  sendRequest(url, { method: 'POST', data: JSON.stringify(data) }, (response) => (handleListFellows(response, type, id.value)), handleErrorFollowers);
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

function addHeaders(table) {
  var thead = document.createElement('thead');
  var orderArrayHeader = ["Id", "Name", "Link", "Action"];
  table.appendChild(thead);

  for (var i = 0; i < orderArrayHeader.length; i++) {
    thead.appendChild(document.createElement("th")).
      appendChild(document.createTextNode(orderArrayHeader[i]));
  }
}

function removeFollower(user, follower,changeFollowersTable) {
  console.log('Delete follower ' + follower + ' from user ' + user);
  var url = baseUrl+'updateFollower.php';
  var data = { 'user': user ,'follower':follower};
  sendRequest(url, { method: 'DELETE', data: JSON.stringify(data) }, (response) => handleRemoveFollower(response,changeFollowersTable), handleErrorRemoveFollower);
}

function handleRemoveFollower(response,searchFollowers){
  console.log('Successfully deleted follower.');
  listFellows(searchFollowers);
}

function handleErrorRemoveFollower(response) {
  var errorMsg = document.getElementById("error-msg");

  // if (response["error_message"]) {

  errorMsg.style.display = "block";
  errorMsg.innerHTML = response['error_message'];
  // } else {
  //   errorMsg.style.display = "none";
  // }
}