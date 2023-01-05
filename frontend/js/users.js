const dir = 'http://localhost:80/project-web-2022/ASCII-Art/';
const baseUrl = dir + 'server/page_controllers/';

function openTab(event, sectionName) {
  updateButtonsMode('prevPage', true);
  updateButtonsMode('nextPage', false);
  var errorMsg = document.getElementById("error-msg");
  errorMsg.style.display = "";
  var id = document.getElementById("user-id");
  if (id.value == '') {
    errorMsg.style.display = "block";
    errorMsg.innerHTML = 'User is not chosen.';
    return;
  }
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(sectionName).style.display = "block";
  event.currentTarget.className += " active";
  sessionStorage.setItem('page', 1);
  if (sectionName == 'users-section') {
    listUsers();
  }
}


function handleListUsers(response, type, userId) {
  var tableName = type + '-tb';
  var table = document.getElementById(tableName);
  table.innerHTML = '';
  addHeaders(table);

  console.log(response);
  var users = response['users'];
  if (users.length < 20) {
    updateButtonsMode('nextPage', true);
  }
  if (users.length == 0) {
    console.log('No users found.')
    // TODO add message on the UI or something else
    return;
  }

  users.forEach(item => {
    let row = table.insertRow();
    let date = row.insertCell(0);
    date.innerHTML = item.id;
    let name = row.insertCell(1);
    name.innerHTML = item.username;
    let link = row.insertCell(2);
    link.appendChild(createLink(item.id));
    if (item.id == userId) {
      addButtons(row, userId, item.id, true, true, true);
      return;
    }
    addButtons(row, userId, item.id, !item.is_follower, !item.is_following, item.is_following);
  });
}

function handleErrorUsers(response) {
  var errorMsg = document.getElementById("error-msg");

  // if (response["error_message"]) {

  errorMsg.style.display = "block";
  errorMsg.innerHTML = response['error_message'];
  // } else {
  //   errorMsg.style.display = "none";
  // }
}

function listUsers() {
  var id = document.getElementById("user-id");
  var url = baseUrl + 'users.php?user=' + id.value + '&&page=1';
  var type = 'users';
  sendRequest(url, { method: 'GET', data: '' }, (response) => handleListUsers(response, type, id.value), handleErrorUsers);
}


function lookupUser() {
  var id = document.getElementById("user-id");
  var name = document.getElementById("user-name");
  var url = baseUrl + 'user.php?user=' + name.value + '&&page=' + sessionStorage.getItem('page');
  var type = 'user-by-name';
  sendRequest(url, { method: 'GET', data: '' }, (response) => handleListUsers(response, type, id.value), handleErrorUsers);
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
  var orderArrayHeader = ["Id", "Name", "Link", "Remove from followers", "Unfollow", "Follow"];
  table.appendChild(thead);

  for (var i = 0; i < orderArrayHeader.length; i++) {
    thead.appendChild(document.createElement("th")).
      appendChild(document.createTextNode(orderArrayHeader[i]));
  }
}

function removeFollower(user, follower) {
  console.log('Delete follower ' + follower + ' from user ' + user);
  var url = baseUrl + 'updateFollower.php';
  var data = { 'user': user, 'follower': follower };
  sendRequest(url, { method: 'DELETE', data: JSON.stringify(data) }, (response) => handleUpdateFollower(response, 'Successfully deleted follower.'), handleErrorUpdateFollower);
}

function handleUpdateFollower(response, msg) {
  console.log(msg);
  listUsers();
}

function handleErrorUpdateFollower(response) {
  var errorMsg = document.getElementById("error-msg");

  // if (response["error_message"]) {

  errorMsg.style.display = "block";
  errorMsg.innerHTML = response['error_message'];
  // } else {
  //   errorMsg.style.display = "none";
  // }
}

function createLink(userId) {
  var a = document.createElement('a');
  var linkText = document.createTextNode("user info");
  a.appendChild(linkText);
  a.target = '_blank';
  a.href = dir + 'frontend/html/userInfo.html?user=' + userId;
  return a;
}

function createDeleteButton(removeThisFollower, disable, userId, otherId) {
  let removeBtn = document.createElement("button");
  if (removeThisFollower) {
    removeBtn.innerHTML = "Remove from followers";
  } else {
    removeBtn.innerHTML = "Unfollow";
  }
  removeBtn.disabled = disable;
  removeBtn.onclick = function () {
    if (removeThisFollower) {

      removeFollower(userId, otherId);
      return;
    }
    removeFollower(otherId, userId);
  };
  return removeBtn;
}

function createAddButton(disable, userId, otherId) {
  let addBtn = document.createElement("button");
  addBtn.innerHTML = "Follow";
  addBtn.onclick = function () {
    addFollower(otherId, userId);
  };
  addBtn.disabled = disable;
  return addBtn;
}

function addFollower(user, follower) {
  console.log('Add follower ' + follower + ' to user ' + user);
  var url = baseUrl + 'updateFollower.php';
  var data = { 'user': user, 'follower': follower };
  sendRequest(url, { method: 'POST', data: JSON.stringify(data) }, (response) => handleUpdateFollower(response, 'Successfully added follower.'), handleErrorUpdateFollower);
}


function page(addition, refreshUsers) {
  var currentPage = parseInt(sessionStorage.getItem('page'));
  currentPage += parseInt(addition);

  if (addition == -1) {
    updateButtonsMode('nextPage', false);
  }
  if (currentPage <= 1) {
    updateButtonsMode('prevPage', true);
  }
  if (currentPage < 1) { return; }
  if (currentPage > 1) {
    updateButtonsMode('prevPage', false);
  }
  sessionStorage.setItem('page', currentPage);
  if (refreshUsers) {
    listUsers();
    return;
  }
  lookupUser();
}

function updateButtonsMode(buttonClass, newMode) {
  var btns = document.getElementsByClassName(buttonClass);
  Array.from(btns).forEach(btn => { btn.disabled = newMode; });
}


function addButtons(row, userId, otherId, removeFollowerDisabled, removeFollowingDisabled, addFollowerDisabled) {
  let removeFollower = row.insertCell(3);
  removeFollower.appendChild(createDeleteButton(true, removeFollowerDisabled, userId, otherId));
  let removeFollowing = row.insertCell(4);
  removeFollowing.appendChild(createDeleteButton(false, removeFollowingDisabled, userId, otherId));
  let add = row.insertCell(5);
  add.appendChild(createAddButton(addFollowerDisabled, userId, otherId));
}