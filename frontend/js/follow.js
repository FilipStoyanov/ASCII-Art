const dir = '../../';
const baseUrl = dir + 'server/page_controllers/follow/';
sessionStorage.setItem('userId', 2);

function openTab(event, sectionName) {
  setupPages(sectionName);
  var errorMsg = document.getElementById("error-msg");
  errorMsg.style.display = "";
  var userId = sessionStorage.getItem('user');
  if (userId === null) {
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
  listFellows(sectionName == 'followers-section');
}

function setupPages(sectionName) {
  sessionStorage.setItem('user', 3);// TO DO delete
  updateButtonsMode('prevPage', true);
  updateButtonsMode('nextPage', false);
  sessionStorage.setItem('page', 1);
  sessionStorage.setItem('section', sectionName);
}

function handleListFellows(response, type, userId) {
  var tableName = type + '-tb';
  var table = document.getElementById(tableName);
  table.innerHTML = '';
  addHeaders(table);

  console.log(response);
  var followers = response[type];
  console.log(followers);
  if (followers.length < 20) {
    updateButtonsMode('nextPage', true);
  }

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
    name.innerHTML = item.username;
    let link = row.insertCell(2);
    link.appendChild(createLink(item.id));
    let removeBtn = document.createElement("button");
    removeBtn.innerHTML = "Remove this user from " + type;
    removeBtn.onclick = function () {
      if (type == 'followers') {
        removeFollower(userId, item.id, true);
        return;
      }
      removeFollower(item.id, userId, false);
    };
    let remove = row.insertCell(3);
    remove.appendChild(removeBtn)
  });
}

function handleErrorFollowers(response) {
  var errorMsg = document.getElementById("error-msg");

  // if (response["error"]) {

  errorMsg.style.display = "block";
  errorMsg.innerHTML = response['error'];
  // } else {
  //   errorMsg.style.display = "none";
  // }
}

function listFellows(searchFollowers) {
  var userId = sessionStorage.getItem('user');
  var url;
  var type = '';
  if (searchFollowers) {
    url = baseUrl + 'listFollowers.php';
    type = 'followers';
  } else {
    url = baseUrl + 'listFollowings.php';
    type = 'followings';
  }
  url += '?user=' + userId + '&&page=' + sessionStorage.getItem("page");
  sendRequest(url, { method: 'GET', data: '' }, (response) => (handleListFellows(response, type, userId)), handleErrorFollowers);
}


function sendRequest(url, options, successCallback, errorCallback) {
  var request = new XMLHttpRequest();

  request.onload = function () {
    var response = JSON.parse(request.responseText);

    if (request.status === 200 && response['success']) {
      successCallback(response);
    } else {
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

function removeFollower(user, follower, changeFollowersTable) {
  console.log('Delete follower ' + follower + ' from user ' + user);
  var url = baseUrl + 'updateFollower.php';
  var data = { 'user': user, 'follower': follower };
  sendRequest(url, { method: 'DELETE', data: JSON.stringify(data) }, (response) => handleRemoveFollower(response, changeFollowersTable), handleErrorRemoveFollower);
}

function handleRemoveFollower(response, searchFollowers) {
  console.log('Successfully deleted follower.');
  sessionStorage.setItem("page", 1);
  listFellows(searchFollowers);//TODO decide whether to go back to first page on delete
}

function handleErrorRemoveFollower(response) {
  var errorMsg = document.getElementById("error-msg");

  // if (response["error"]) {

  errorMsg.style.display = "block";
  errorMsg.innerHTML = response['error'];
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


function page(addition, refreshFollowers) {
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
  listFellows(refreshFollowers);
}

function updateButtonsMode(buttonClass, newMode) {
  var btns = document.getElementsByClassName(buttonClass);
  Array.from(btns).forEach(btn => { btn.disabled = newMode; });
}