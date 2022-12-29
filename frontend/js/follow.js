
function listFollowers() {
    var listFollowers = document.getElementById("listFollowers");
    var id = document.getElementById("user-id");
    console.log("azz "+id)
    let formData = new FormData();
    let response;
    formData.append("user",id.value);
    ajax_request = new XMLHttpRequest();
    // var followers = document.getElementById("followers");
    // response = [
    //   { date: "10/17/2019", name: "john doe" },
    //   { date: "10/18/2019", name: "jane doe" },
    // ];
    // function loadTableData(items) {
    //   items.forEach( item => {
    //     let row = followers.insertRow();
    //     let id = row.insertCell(0);
    //     id.innerHTML = item.id;
    //     let name = row.insertCell(1);
    //     name.innerHTML = item.name;
    //     let link = row.insertCell(2);
    //     name.innerHTML =  item.name;
    //   });
    // }
    // loadTableData(response);
  //   fetch("http://localhost:80/project-web-2022/ASCII-Art/server/page_controllers/follow.php")
  // .then((response) =>{console.log(response); return response.json();})
  // .then((data) => console.log(data));
    ajax_request.open("GET", "http://localhost:80/project-web-2022/ASCII-Art/server/page_controllers/follow.php");
    ajax_request.send(formData);
    ajax_request.onreadystatechange = function () {
      if (ajax_request.readyState == 4 && ajax_request.status == 200) {
        if (ajax_request.responseText) {
            console.log(ajax_request.responseText);
          response = JSON.parse(ajax_request.responseText);
          console.log(response);
        }
        if (response["success"] == true) {
          window.location.assign("home.html");
          var followers = document.getElementById("followers");
          const items2 = [
            { date: "10/17/2019", name: "john doe" },
            { date: "10/18/2019", name: "jane doe" },
          ];
          function loadTableData(items) {
            items.forEach( item => {
              let row = followers.insertRow();
              let date = row.insertCell(0);
              date.innerHTML = item.date;
              let name = row.insertCell(1);
              name.innerHTML = item.name;
            });
          }
          loadTableData(items2);
        } else if (response["success"] == false) {
          if (response["errors"] && response["errors"]["name"]) {
            errorMsg.style.display = "block";
            errorMsg.innerHTML = "A user with this username already exists.";
          } else {
            errorMsg.style.display = "none";
          }
        }
      }
    };
}


function azz(){
    console.log("azsasadad");
}
// var listFollowers = document.getElementById("listFollowers");
