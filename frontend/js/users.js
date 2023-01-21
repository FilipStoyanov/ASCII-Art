// const dir = 'http://localhost:80/project-web-2022/ASCII-Art/';
const dir = '../../';
const baseUrl = dir + 'server/page_controllers/users/';
const baseFollowUrl = dir + 'server/page_controllers/follow/';
sessionStorage.setItem('user', 2);
function openTab(event, sectionName) {
  sessionStorage.setItem('section', sectionName);
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


function handleListUsers(response, type, userId,listAllUsers) {
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
      addButtons(row, userId, item.id, true, true, true,listAllUsers);
      return;
    }
    addButtons(row, userId, item.id, !item.is_follower, !item.is_following, item.is_following,listAllUsers);
  });
}


// MODAL
var modal = document.getElementById("modal");

var modalCloseBtn = document.getElementsByClassName("close")[0];

function handleErrorUsers(response) {
  // var errorMsg = document.getElementById("error-msg");

  // errorMsg.style.display = "block";
  // errorMsg.innerHTML = response['error'];
  if ("error" in response) {
    console.error(response['error']);
    showModalForSeconds();
    var modalContent = document.getElementsByClassName("modal-body")[0]
    modalContent.innerHTML = "An error has occurred. Try again."
  } else {
    document.getElementById(sessionStorage.getItem('section')).classList.remove("show-modal");
  }
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
  // var id = document.getElementById("user-id");
  var url = baseUrl + 'users.php?user=' + sessionStorage.getItem('user') + '&&page=' + sessionStorage.getItem('page');
  var type = 'users';
  sendRequest(url, { method: 'GET', data: '' }, (response) => handleListUsers(response, type, sessionStorage.getItem('user'),true), handleErrorUsers);
}


function lookupUser() {
  // var id = document.getElementById("user-id");
  var name = document.getElementById("user-name");
  var url = baseUrl + 'user.php?user=' + name.value + '&&page=' + sessionStorage.getItem('page') + '&&owner=' + sessionStorage.getItem('user');
  var type = 'user-by-name';
  sendRequest(url, { method: 'GET', data: '' }, (response) => handleListUsers(response, type, sessionStorage.getItem('user'),false), handleErrorUsers);
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

function removeFollower(user, follower,listAllUsers) {
  console.log('Delete follower ' + follower + ' from user ' + user);
  var url = baseFollowUrl + 'updateFollower.php';
  var data = { 'user': user, 'follower': follower };
  sendRequest(url, { method: 'DELETE', data: JSON.stringify(data) }, (response) => handleUpdateFollower(listAllUsers, response, 'Successfully deleted follower.'), handleErrorUpdateFollower);
}

function handleUpdateFollower(listAllUsers, response, msg) {
  console.log(msg);
  if (listAllUsers) {
    listUsers();
    return;
  }
  lookupUser();
}

function handleErrorUpdateFollower(response) {
  // var errorMsg = document.getElementById("error-msg");

  // errorMsg.style.display = "block";
  // errorMsg.innerHTML = response['error'];
  if ('error' in response) {
    console.error(response['error']);
    showModalForSeconds();
    modalContent.innerHTML = "An error has occurred. Try again."
  } else {
    document.getElementsByClassName("editor")[0].classList.remove("show-modal");
  }
}

function createLink(userId) {
  var a = document.createElement('a');
  var linkText = document.createTextNode("user info");
  a.appendChild(linkText);
  a.target = '_blank';
  a.href = dir + 'frontend/html/userInfo.html?user=' + userId;
  return a;
}

function createDeleteButton(removeThisFollower, disable, userId, otherId,listAllUsers) {
  let removeBtn = document.createElement("button");
  if (removeThisFollower) {
    removeBtn.innerHTML = "Remove from followers";
  } else {
    removeBtn.innerHTML = "Unfollow";
  }
  removeBtn.disabled = disable;
  removeBtn.onclick = function () {
    if (removeThisFollower) {

      removeFollower(userId, otherId,listAllUsers);
      return;
    }
    removeFollower(otherId, userId,listAllUsers);
  };
  return removeBtn;
}

function createAddButton(disable, userId, otherId,listAllUsers) {
  let addBtn = document.createElement("button");
  addBtn.innerHTML = "Follow";
  addBtn.onclick = function () {
    addFollower(otherId, userId,listAllUsers);
  };
  addBtn.disabled = disable;
  return addBtn;
}

function addFollower(user, follower,listAllUsers) {
  console.log('Add follower ' + follower + ' to user ' + user);
  var url = baseFollowUrl + 'updateFollower.php';
  var data = { 'user': user, 'follower': follower };
  sendRequest(url, { method: 'POST', data: JSON.stringify(data) }, (response) => handleUpdateFollower(listAllUsers,response, 'Successfully added follower.'), handleErrorUpdateFollower);
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


function addButtons(row, userId, otherId, removeFollowerDisabled, removeFollowingDisabled, addFollowerDisabled,listAllUsers) {
  let removeFollower = row.insertCell(3);
  removeFollower.appendChild(createDeleteButton(true, removeFollowerDisabled, userId, otherId,listAllUsers));
  let removeFollowing = row.insertCell(4);
  removeFollowing.appendChild(createDeleteButton(false, removeFollowingDisabled, userId, otherId,listAllUsers));
  let add = row.insertCell(5);
  add.appendChild(createAddButton(addFollowerDisabled, userId, otherId,listAllUsers));
}