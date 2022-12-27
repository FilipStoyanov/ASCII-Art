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

//when the response is ok
function loadSignIn(response) {
  if (response["success"]) {
    window.location.assign("home.html");
  } else {
    console.log(response["errors"]);
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

  sendRequest('../../server/page_controllers/signin.php', { method: 'POST', data: `data=${JSON.stringify(data)}` }, loadSignIn, handleErrorSignIn);
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
    window.location.assign("home.html");
  } else {
    if (response["errors"]) {
      errorMsgForLogin.style.display = "block";
      errorMsgForLogin.innerHTML = "Invalid username or password";
    } else {
      errorMsgForLogin.style.display = "none";
    }
  }
}

//what to do when the response isn't successful
function handleErrorLogIn(response) {
  if (response["errors"]) {
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
  console.log(`data=${JSON.stringify(data)}`);
  sendRequest('../../server/page_controllers/login.php', { method: 'POST', data: `data=${JSON.stringify(data)}` }, loadLogIn, handleErrorLogIn);
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
      } else {
        errorMsgForLogin.style.display = "none";
      }

      if (passwordField && passwordField.value.length < 6) {
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

// call functions after DOM is loaded
document.addEventListener("DOMContentLoaded", function (event) {
  submitSignInForm();
  submitLogInForm();
});


