var loginForm = document.getElementById("loginForm");
var signinForm = document.getElementById("signinForm");
var ajax_request = new XMLHttpRequest();
var errorMsg = document.getElementsByClassName("error-dup-username")[0];
var errorMsgForUsername = document.getElementsByClassName("error-username")[0];
var errorMsgForPassword = document.getElementsByClassName("error-password")[0];
var errorMsgForLogin = document.getElementsByClassName("error-credentials")[0];

//make a request to the {$url}
//{$options} what type of request 'POST' 'GET'
//successCallback when the response is ok
//errorCallback not ok
function sendRequest(url, options, successCallback, errorCallback) {
  var request = new XMLHttpRequest();

  request.onload = function () {
    let response;
    if (request.responseText) {
      response = JSON.parse(request.responseText);
    }

    if (request.status === 200) {
      successCallback(response);
    } else if (request.status === 401) {
      localStorage.clear();
      removeCookie("token", "/");
      window.location.assign("login.html");
      console.log("Not authorized");
      errorCallback(response);
    }
  };

  request.open(options.method, url, true);
  request.setRequestHeader("Authorization", "Bearer " + options.token);
  request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  request.send(options.data);
}

//when the response is ok
function loadSignIn(response) {
  if (response["success"]) {
    setCookie("token", response["token"], 30);
    window.location.assign("editor.html");
    localStorage.setItem("username", response["username"]);
  } else {
    if (response["errors"]) {
      errorMsg.style.display = "block";
      errorMsg.innerHTML = "A user with this username already exists.";
    } else {
      errorMsg.style.display = "none";
    }
  }
}

//what to do when the response is not ok
function handleErrorSignIn(response) {
  if (response["errors"]) {
    errorMsg.style.display = "block";
    errorMsg.innerHTML = "A user with this username already exists.";
  } else {
    errorMsg.style.display = "none";
  }
}

//read the form and send the request to signin.php
function signInForm() {
  let formElement = document.getElementsByClassName("signin-data");
  let formData = new FormData();
  for (let i = 0; i < formElement.length; ++i) {
    formData.append(formElement[i].name, formElement[i].value);
  }

  var data = {};
  formData.forEach(function (value, key) {
    data[key] = value;
  });

  sendRequest(
    "../../server/page_controllers/signin.php",
    { method: "POST", data: `data=${JSON.stringify(data)}` },
    loadSignIn,
    handleErrorSignIn
  );
}

function submitSignInForm() {
  if (signinForm) {
    signinForm.addEventListener("submit", function (event) {
      let usernameField = document.getElementById("username");
      let passwordField = document.getElementById("password");
      let passwordRepeatField = document.getElementById("repeat-password");
      let validUsernameAndPassword = true;

      if (usernameField && usernameField.value.length < 3) {
        errorMsgForUsername.style.display = "block";
        errorMsgForUsername.innerHTML =
          "Username must contain at least 3 characters";
        validUsernameAndPassword = false;
      } else {
        errorMsgForUsername.style.display = "none";
      }

      if (passwordField && passwordField.value.length < 6) {
        errorMsgForPassword.style.display = "block";
        errorMsgForPassword.innerHTML =
          "Password must contain at least 6 characters. <br/>";
        validUsernameAndPassword = false;
      } else if (
        passwordField &&
        passwordRepeatField &&
        passwordField.value != passwordRepeatField.value
      ) {
        errorMsgForPassword.style.display = "block";
        errorMsgForPassword.innerHTML = "Passwords do not match.";
        validUsernameAndPassword = false;
      } else {
        errorMsgForPassword.style.display = "none";
      }

      if (!validUsernameAndPassword) {
        errorMsg.style.display = "none";
      }

      if (validUsernameAndPassword) {
        signInForm();
      }

      event.preventDefault();
    });
  }
}

//when the response is ok (code 200)
function loadLogIn(response) {
  if (response["success"]) {
    errorMsgForLogin.style.display = "none";
    setCookie("token", response["token"], 30);
    localStorage.setItem("username", response["username"]);
    window.location.assign("editor.html");
  } else {
    if (response["message"]) {
      errorMsgForLogin.style.display = "block";
      errorMsgForLogin.innerHTML = "Invalid username or password";
    } else {
      errorMsgForLogin.style.display = "none";
    }
  }
}

function setCookie(name, value, minutes) {
  var expires = "";
  if (minutes) {
    var date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function removeCookie(name, path) {
  document.cookie =
    name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;path=" + path;
}

//what to do when the response isn't successful
function handleErrorLogIn(response) {
  if (!response["success"]) {
    errorMsgForLogin.style.display = "block";
    errorMsgForLogin.innerHTML = "A user with this username already exists.";
  } else {
    errorMsgForLogin.style.display = "none";
  }
}

//format the input data from the form and send the request
function logInForm() {
  let formElement = document.getElementsByClassName("login-data");
  let formData = new FormData();
  for (let i = 0; i < formElement.length; ++i) {
    formData.append(formElement[i].name, formElement[i].value);
  }

  var data = {};
  formData.forEach(function (value, key) {
    data[key] = value;
  });
  sendRequest(
    "../../server/page_controllers/login.php",
    { method: "POST", data: `data=${JSON.stringify(data)}` },
    loadLogIn,
    handleErrorLogIn
  );
}

//doesnt quite work it still prevents sending the request
//says when the passowrd is less than 6 characters
//but does not do that for the username
//tried making it like the signin but i guess there are some differences in the html
function submitLogInForm() {
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      let usernameField = document.getElementById("login-username");
      let passwordField = document.getElementById("login-password");
      let validUsernameAndPassword = true;

      if (usernameField && usernameField.value.length < 3) {
        errorMsgForLogin.style.display = "block";
        errorMsgForLogin.innerHTML =
          "Username must contain at least 3 characters";
        validUsernameAndPassword = false;
      } else if (passwordField && passwordField.value.length < 6) {
        errorMsgForLogin.style.display = "block";
        errorMsgForLogin.innerHTML =
          "Password must contain at least 6 characters. <br/>";
        validUsernameAndPassword = false;
      } else {
        errorMsgForLogin.style.display = "none";
      }

      if (validUsernameAndPassword) {
        logInForm();
      }

      event.preventDefault();
    });
  }
}

function toggleMenu() {
  const hamburgerMenu = document.getElementsByClassName("header-button")[0];
  const navigation = document.getElementsByClassName("navigation-mobile")[0];
  const header = document.getElementsByClassName("header")[0];
  const bodyElement = document.getElementsByTagName("body")[0];
  const mobileMenu = document.querySelector(".navigation-mobile");
  const greetingText = document.querySelector(".greeting-mobile");
  const navLinks = mobileMenu.children;
  for (let i = 0; i < navLinks.length; ++i) {
    navLinks[i].addEventListener("click", function () {
      greetingText.classList.toggle("show");
      hamburgerMenu.classList.toggle("open");
      bodyElement.classList.toggle("overflow-hidden");
      navigation.classList.toggle("show");
      header.classList.toggle("show");
      window.location.reload();
    });
    if (navLinks[i].classList.contains("logout")) {
      localStorage.clear();
      removeCookie("token", "/");
      window.location.assign("login.html");
    }
  }
}

function clickOnHamburgerMenu() {
  const hamburgerMenu = document.getElementsByClassName("header-button")[0];
  const navigation = document.getElementsByClassName("navigation-mobile")[0];
  const header = document.getElementsByClassName("header")[0];
  const bodyElement = document.getElementsByTagName("body")[0];
  const greetingText = document.querySelector(".greeting-mobile");
  if (hamburgerMenu) {
    hamburgerMenu.addEventListener("click", function () {
      greetingText.classList.toggle("show");
      hamburgerMenu.classList.toggle("open");
      bodyElement.classList.toggle("overflow-hidden");
      navigation.classList.toggle("show");
      header.classList.toggle("show");
    });
  }
}

function logout() {
  const logoutBtn = document.getElementsByClassName("logout")[0];
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (event) {
      event.preventDefault();
      localStorage.clear();
      removeCookie("token", "/");
      window.location.assign("login.html");
    });
  }
}

function setHeaderName() {
  const username = localStorage.getItem("username");
  const greeting = document.getElementsByClassName("greeting")[0];
  const greetingMobile = document.getElementsByClassName("greeting-mobile")[0];
  if (greeting) {
    greeting.innerHTML = `Hello, ${username}`;
  }
  if (greetingMobile) {
    greetingMobile.innerHTML = `Hello, ${username}`;
  }
}

// call functions after DOM is loaded
document.addEventListener("DOMContentLoaded", function (event) {
  setHeaderName();
  submitSignInForm();
  submitLogInForm();
  clickOnHamburgerMenu();
  logout();
});
