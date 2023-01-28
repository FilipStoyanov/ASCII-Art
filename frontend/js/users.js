const dir = '../../';
const baseUrl = dir + 'server/page_controllers/users/';
const baseFollowUrl = dir + 'server/page_controllers/follow/';

function openTab(event, sectionName) {
  setupPages(sectionName);
  var errorMsg = document.getElementById("error-msg");
  errorMsg.style.display = "";
  if (getCookie('token') === null) {
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

  if (sectionName == 'users-section') {
    clearFoundUsers();
    listUsers();
  }
}

function setupPages(sectionName) {
  updateButtonsMode('prevPage', true);
  updateButtonsMode('nextPage', false);
  sessionStorage.setItem('page', 1);
  sessionStorage.setItem('section', sectionName);
}

function clearFoundUsers() {
  var inputField = document.getElementById('user-name');
  inputField.value = '';
  var table = document.getElementById('user-by-name-tb');
  table.innerHTML = '';
  addHeaders(table);
  return table;
}

function handleListUsers(response, type, listAllUsers) {
  let userId = response['user'];
  var tableName = type + '-tb';
  var table = document.getElementById(tableName);
  table.innerHTML = '';
  addHeaders(table);

  var users = response['users'];
  if (users.length < 20) {
    updateButtonsMode('nextPage', true);
  }
  if (users.length == 0) {
    console.log('No users found.')
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
      addButtons(row, userId, item.id, true, true, true, listAllUsers);
      return;
    }
    addButtons(row, userId, item.id, !item.is_follower, !item.is_following, item.is_following, listAllUsers);
  });
}



var modal = document.getElementById("modal");

var modalCloseBtn = document.getElementsByClassName("close")[0];

function handleError(response, isErrorInAuth) {
  let message = "An error has occurred. Try again.";

  if (isErrorInAuth) {
    message = "An error with the authentication has occured. Please, logout and login again."
  }
  var modalContents = document.getElementsByClassName("modal-body");
  Array.from(modalContents).forEach(modalContent => { modalContent.innerHTML = message; });
  showModalForSeconds();
}

function showModalForSeconds(reload = false) {
  document.getElementById(sessionStorage.getItem('section')).classList.add("show-modal");
  setTimeout(() => {
    document.getElementById(sessionStorage.getItem('section')).classList.remove("show-modal");
    if (reload) {
      window.location.reload();
    }
  }, 3000);
}


function modalFunctionality() {

  modalCloseBtn.onclick = function () {
    modal.style.display = "none";
    document.getElementById("main").classLis.remove("show-modal");
    window.location.reload();
  }

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      document.getElementById("main").classList.remove("show-modal");
      window.location.reload();
    }
  }
}

function listUsers() {
  var url = baseUrl + 'users.php?' + '&&page=' + sessionStorage.getItem('page');
  var type = 'users';
  sendRequestWithHeaders(url, { method: 'GET', data: '' }, (response) => handleListUsers(response, type, true), handleError);
}


function lookupUser() {
  var name = document.getElementById("user-name");
  var url = baseUrl + 'user.php?user=' + name.value + '&&page=' + sessionStorage.getItem('page');
  var type = 'user-by-name';
  sendRequestWithHeaders(url, { method: 'GET', data: '' }, (response) => handleListUsers(response, type, false), handleError);
}


function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function sendRequestWithHeaders(url, options, successCallback, errorCallback) {
  let token = getCookie("token");
  var request = new XMLHttpRequest();

  request.onload = function () {
    var response = JSON.parse(request.responseText);
    if (request.status === 200 && response['success']) {
      setCookie('token', response["token"], 1);
      successCallback(response);
    } else if (request.status ==401 || request.status ==403) {
      setCookie('token', token, 1);
      errorCallback(response, true);
    }
    else {
      setCookie('token', token, 1);
      errorCallback(response, false);
    }
  };

  request.open(options.method, url, true);
  request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  request.setRequestHeader("Accept", "application/json");
  if (token) {
    request.setRequestHeader("Authorization", "Bearer " + token);
  }
  request.send(options.data);
}

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
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

function removeFollower(user, follower, listAllUsers) {
  console.log('Delete follower ' + follower + ' from user ' + user);
  var url = baseFollowUrl + 'updateFollower.php';
  var data = { 'user': user, 'follower': follower };
  sendRequestWithHeaders(url, { method: 'DELETE', data: JSON.stringify(data) }, (response) => handleUpdateFollower(listAllUsers, response, 'Successfully deleted follower.'), handleError);
}

function handleUpdateFollower(listAllUsers, response, msg) {
  if (listAllUsers) {
    listUsers();
    return;
  }
  lookupUser();
}


function createLink(userId) {
  var a = document.createElement('a');
  var linkText = document.createTextNode("user info");
  a.appendChild(linkText);
  a.target = '_blank';
  a.href = dir + 'frontend/html/userInfo.html?user=' + userId;
  return a;
}

function createDeleteButton(removeThisFollower, disable, userId, otherId, listAllUsers) {
  let removeBtn = document.createElement("button");
  if (removeThisFollower) {
    removeBtn.innerHTML = "Remove from followers";
  } else {
    removeBtn.innerHTML = "Unfollow";
  }
  removeBtn.disabled = disable;
  removeBtn.onclick = function () {
    if (removeThisFollower) {

      removeFollower(userId, otherId, listAllUsers);
      return;
    }
    removeFollower(otherId, userId, listAllUsers);
  };
  return removeBtn;
}

function createAddButton(disable, userId, otherId, listAllUsers) {
  let addBtn = document.createElement("button");
  addBtn.innerHTML = "Follow";
  addBtn.onclick = function () {
    addFollower(otherId, userId, listAllUsers);
  };
  addBtn.disabled = disable;
  return addBtn;
}

function addFollower(user, follower, listAllUsers) {
  console.log('Add follower ' + follower + ' to user ' + user);
  var url = baseFollowUrl + 'updateFollower.php';
  var data = { 'user': user, 'follower': follower };
  sendRequestWithHeaders(url, { method: 'POST', data: JSON.stringify(data) }, (response) => handleUpdateFollower(listAllUsers, response, 'Successfully added follower.'), handleError);
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


function addButtons(row, userId, otherId, removeFollowerDisabled, removeFollowingDisabled, addFollowerDisabled, listAllUsers) {
  let removeFollower = row.insertCell(3);
  removeFollower.appendChild(createDeleteButton(true, removeFollowerDisabled, userId, otherId, listAllUsers));
  let removeFollowing = row.insertCell(4);
  removeFollowing.appendChild(createDeleteButton(false, removeFollowingDisabled, userId, otherId, listAllUsers));
  let add = row.insertCell(5);
  add.appendChild(createAddButton(addFollowerDisabled, userId, otherId, listAllUsers));
}