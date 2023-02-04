const dir = "../../";
const baseUrl = dir + "server/page_controllers/follow/";

function openTab(event, sectionName) {
  setupPages(sectionName);
  var errorMsg = document.getElementById("error-msg");
  errorMsg.style.display = "";

  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  if (event.currentTarget != document) {
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].classList.remove("active");
    }
  }
  document.getElementById(sectionName).style.display = "block";
  event.currentTarget.className += " active";
  listFellows(sectionName == "followers-section");
}

function setupPages(sectionName) {
  updateButtonsMode("prevPage", true);
  updateButtonsMode("nextPage", false);
  sessionStorage.setItem("page", 1);
  sessionStorage.setItem("section", sectionName);
}

function handleListFellows(response, type) {
  let userId = response["user"];
  var tableName = type + "-tb";
  var table = document.getElementById(tableName);
  var notFound = document.getElementsByClassName("not-found");
  var pagination = document.getElementsByClassName("button-wrapper");
  table.innerHTML = "";
  addHeaders(table);

  var followers = response[type];
  if (followers.length < 20) {
    table.style.display = "table";
    notFound[0].style.display = "none";
    notFound[1].style.display = "none";
    pagination[0].style.display = "block";
    pagination[1].style.display = "block";
    updateButtonsMode("nextPage", true);
  }

  if (followers.length == 0) {
    table.style.display = "none";
    notFound[0].style.display = "block";
    notFound[1].style.display = "block";
    pagination[0].style.display = "none";
    pagination[1].style.display = "none";
    return;
  }
  const page = parseInt(sessionStorage.getItem("page"));
  followers.forEach((item, index) => {
    let row = table.insertRow();
    let date = row.insertCell(0);
    date.innerHTML = ( (page - 1) * 20 + index + 1);
    let name = row.insertCell(1);
    name.innerHTML = item.username;
    let link = row.insertCell(2);
    link.appendChild(createLink(item.id));
    let removeBtn = document.createElement("button");
    removeBtn.innerHTML = "Remove from " + type;
    removeBtn.classList.add("removeBtn");
    removeBtn.onclick = function () {
      if (type == "followers") {
        removeFollower(userId, item.id, true);
        return;
      }
      removeFollower(item.id, userId, false);
    };
    let remove = row.insertCell(3);
    remove.appendChild(removeBtn);
  });
}

function handleError(response, isErrorInAuth) {
  let message = "An error has occurred. Try again.";
  if (isErrorInAuth) {
      message = "An error with the authentication has occured. Please, logout and login again."
      var modalContents = document.getElementsByClassName("modal-body");
      Array.from(modalContents).forEach(modalContent => { modalContent.innerHTML = message; });
      showModalForSeconds();
      window.location.assign("login.html");
      return;
  }
  var modalContents = document.getElementsByClassName("modal-body");
  Array.from(modalContents).forEach(modalContent => { modalContent.innerHTML = message; });
  showModalForSeconds();
}

function showModalForSeconds(reload = false) {
  var tabcontents = document.getElementsByClassName("tabcontent");
  Array.from(tabcontents).forEach((tabcontent) => {
    tabcontent.classList.add("show-modal");
  });
  setTimeout(() => {
    Array.from(tabcontents).forEach((tabcontent) => {
      tabcontent.classList.remove("show-modal");
    });
    if (reload) {
      window.location.reload();
    }
  }, 3000);
}

function listFellows(searchFollowers) {
  var url;
  var type = "";
  if (searchFollowers) {
    url = baseUrl + "listFollowers.php";
    type = "followers";
  } else {
    url = baseUrl + "listFollowings.php";
    type = "followings";
  }
  url += "?page=" + sessionStorage.getItem("page");
  sendRequestWithHeaders(
    url,
    { method: "GET", data: "" },
    (response) => handleListFellows(response, type),
    handleError
  );
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function sendRequestWithHeaders(url, options, successCallback, errorCallback) {
  let token = getCookie("token");
  var request = new XMLHttpRequest();

  request.onload = function () {
    var response = JSON.parse(request.responseText);
    if (request.status === 200 && response["success"]) {
      setCookie("token", response["token"], 30);
      successCallback(response);
    } else if (request.status == 401 || request.status == 403) {
      setCookie("token", token, 30);
      errorCallback(response, true);
    } else {
      setCookie("token", token, 30);
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
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function addHeaders(table) {
  var thead = document.createElement("thead");
  var orderArrayHeader = ["№", "Username", "Link", "Action"];
  table.appendChild(thead);

  for (var i = 0; i < orderArrayHeader.length; i++) {
    thead
      .appendChild(document.createElement("th"))
      .appendChild(document.createTextNode(orderArrayHeader[i]));
  }
}

function removeFollower(user, follower, changeFollowersTable) {
  var url = baseUrl + "updateFollower.php";
  var data = { user: user, follower: follower };
  sendRequestWithHeaders(
    url,
    { method: "DELETE", data: JSON.stringify(data) },
    (response) => handleRemoveFollower(response, changeFollowersTable),
    handleError
  );
}

function handleRemoveFollower(response, searchFollowers) {
  sessionStorage.setItem("page", 1);
  listFellows(searchFollowers);
}

function createLink(userId) {
  var a = document.createElement("a");
  var linkText = document.createTextNode("View user profile");
  a.appendChild(linkText);
  a.classList.add("follower-link");
  a.target = "_blank";
  a.href = dir + "frontend/html/userInfo.html?user=" + userId;
  return a;
}

function page(addition, refreshFollowers) {
  var currentPage = parseInt(sessionStorage.getItem("page"));
  currentPage += parseInt(addition);
  if (addition == -1) {
    updateButtonsMode("nextPage", false);
  }
  if (currentPage <= 1) {
    updateButtonsMode("prevPage", true);
  }
  if (currentPage < 1) {
    return;
  }
  if (currentPage > 1) {
    updateButtonsMode("prevPage", false);
  }
  sessionStorage.setItem("page", currentPage);
  listFellows(refreshFollowers);
}

function updateButtonsMode(buttonClass, newMode) {
  var btns = document.getElementsByClassName(buttonClass);
  Array.from(btns).forEach((btn) => {
    btn.disabled = newMode;
  });
}

document.addEventListener("DOMContentLoaded", function (event) {
  openTab(event, "followers-section");
});
