var loginForm = document.getElementById("loginForm");
var signinForm = document.getElementById("signinForm");
var ajax_request = new XMLHttpRequest();
var errorMsg = document.getElementsByClassName("error-dup-username")[0];
var errorMsgForUsername = document.getElementsByClassName("error-username")[0];
var errorMsgForPassword = document.getElementsByClassName("error-password")[0];
var errorMsgForLogin = document.getElementsByClassName("error-credentials")[0];

function sendRequest(url, options, successCallback, errorCallback) {
  var request = new XMLHttpRequest();

  request.onload = function () {
    var response = JSON.parse(request.responseText);

    if (request.status === 200) {
      successCallback(response);
    } else {
      console.log('Not authorized')
      errorCallback(response);
    }
  }

  request.open(options.method, url, true);
  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  request.send(options.data);
}


function load(response) {
  window.location.assign("home.html");
}

function handleError(response) {
  if (response["errors"] && response["errors"]["name"]) {
    errorMsg.style.display = "block";
    errorMsg.innerHTML = "A user with this username already exists.";
  } else {
    errorMsg.style.display = "none";
  }
}

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
  sendRequest('../../server/page_controllers/signin.php', { method: 'POST', data: `data=${JSON.stringify(data)}` }, load, handleError);


  // for (var pair of formData.entries()) {
  //   console.log(pair[0] + ', ' + pair[1]);
  // }
  // ajax_request.open("POST", "../../server/page_controllers/signin.php");
  // ajax_request.send(formData);
  // ajax_request.onreadystatechange = function () {
  //   if (ajax_request.readyState == 4 && ajax_request.status == 200) {
  //     console.log(ajax_request.responseText);
  //     if (ajax_request.responseText) {
  //       console.log(ajax_request.responseText);
  //       response = JSON.parse(ajax_request.responseText);
  //       console.log(response);
  //     }
  // if (response["success"] == true) {
  //   window.location.assign("home.html");
  // } else if (response["success"] == false) {
  //   if (response["errors"] && response["errors"]["name"]) {
  //     errorMsg.style.display = "block";
  //     errorMsg.innerHTML = "A user with this username already exists.";
  //   } else {
  //     errorMsg.style.display = "none";
  //   }
  // }
  // }
  // };
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

function logInForm() {
  let formElement = document.getElementsByClassName("login-data");
  let formData = new FormData();
  for (let i = 0; i < formElement.length; ++i) {
    formData.append(formElement[i].name, formElement[i].value);
  }
  ajax_request = new XMLHttpRequest();

  ajax_request.open("POST", "../../server/page_controllers/login.php");
  ajax_request.send(formData);
  ajax_request.onreadystatechange = function () {
    if (ajax_request.readyState == 4 && ajax_request.status == 200) {
      let response = JSON.parse(ajax_request.responseText);
      if (response["success"] == true) {
        errorMsgForLogin.style.display = "none";
        window.location.assign("home.html");
      } else if (response["success"] == false) {
        errorMsgForLogin.style.display = "block";
        errorMsgForLogin.innerHTML = "Invalid username or password";
      }
    }
  };
}

function submitLogInForm() {
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      logInForm();
      event.preventDefault();
    });
  }
}

// call functions after DOM is loaded
document.addEventListener("DOMContentLoaded", function (event) {
  submitSignInForm();
  submitLogInForm();
});
