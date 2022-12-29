function handleListFollowers(response){
  var followersTable = document.getElementById("followers");
  console.log(response);
  var followers = response['followers'];
  console.log(followers);
  followers.forEach( item => {
      let row = followersTable.insertRow();
      let date = row.insertCell(0);
      date.innerHTML = item.id;
      let name = row.insertCell(1);
      name.innerHTML = item.name;
      let link = row.insertCell(2);
      link.innerHTML = 'There will be a link here.';
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
    var id = document.getElementById("user-id");
    var data = {'user':id.value};
    var url = 'http://localhost:80/project-web-2022/ASCII-Art/server/page_controllers/';
    if(searchFollowers){
      url+='follow.php';
    }else{
      url+='following.php'; //TODO add php file
    }
    sendRequest(url, { method: 'POST', data: JSON.stringify(data) }, handleListFollowers, handleErrorFollowers);
}


function sendRequest(url, options, successCallback, errorCallback) {
  var request = new XMLHttpRequest();

  request.onload = function () {
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