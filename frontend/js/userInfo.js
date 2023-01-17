window.addEventListener("load", (event) => {
    sessionStorage.setItem('user', 2);//TODO delete
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const userId = urlParams.get('user');
    sessionStorage.setItem('owner', userId);
});
function openTab(event, sectionName) {

    var errorMsg = document.getElementById("error-msg");
    errorMsg.style.display = "";

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
    setupPages();
    sessionStorage.setItem('current_section', sectionName);
    if (sectionName == 'user-info-img-section') {
        getUserInfoImages();
        return;
    }
    getUserInfoVideos();
}

const baseUrl = 'http://localhost:80/project-web-2022/ASCII-Art/server/page_controllers/';
const userInfoUrl = baseUrl + 'users/userInfo.php';
const allPicturesUrl = baseUrl + 'ascii-editor/getAllPictures.php';
function getUserInfoImages() {
    var url = userInfoUrl + '?user=' + sessionStorage.getItem('owner');

    sendRequest(url, { method: 'GET', data: '' }, handleUserInfo, handleErrorUserInfo);
}



function handleUserInfo(response) {
    var userNameEl = document.getElementById('username');
    userNameEl.innerHTML = response['user']['username'];
    getAllAsciiPictures();
}

function handleErrorUserInfo(response) {
    errorMsg.style.display = "block";
    errorMsg.innerHTML = response['error'];
}


var wrapper = document.getElementsByClassName("wrapper")[0];
function sendRequest(url, options, successCallback, errorCallback) {
    var request = new XMLHttpRequest();
    console.log(url);
    request.onload = function () {
        console.log(url);
        console.log(request.responseText);
        var response = JSON.parse(request.responseText);
        if (request.status === 200 && response['success']) {
            successCallback(response);
        } else {
            console.log("Not authorized");
            errorCallback(response);
        }
    };
    request.open(options.method, url, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(options.data);
}


// get one ascii picture by owner_id and name
function getAsciiText(ownerId, name) {
    sendRequest(
        `http://localhost:80/project-web-2022/ASCII-Art/server/page_controllers/ascii-editor/getAsciiPicture.php?user=${ownerId}&name=${name}`,
        { method: "GET", data: '' },
        displayAsciiPictures,
        handleError,
    );
}

// get all ascii pictures by owner_id
function getAllAsciiPictures() {
    sendRequest(
        allPicturesUrl + `?owner=${sessionStorage.getItem('owner')}&&user=${sessionStorage.getItem('user')}&&page=${sessionStorage.getItem('page')}`,
        { method: "GET", data: '' },
        displayAsciiPictures,
        handleError,
    );
}

// get all friends' ascii pictures
function getAllFriendsPictures(ownerId, page, pageSize) {
    sendRequest(
        `../../server/page_controllers/ascii-editor/getAllFriendsPictures.php?user=${ownerId}&page=${page}&pageSize=${pageSize}`,
        { method: "GET", data: '' },
        displayAsciiPictures,
        handleError,
    );
}

function displayAsciiPictures(response) {
    if (response["success"] && response['pictures']) {
        var wrapper = document.getElementsByClassName("wrapper")[0];
        let pictures = response['pictures'];
        if (pictures.length < 10) {
            updateButtonsMode('nextPage', true);
        }
        if (pictures.length == 0) {
            console.log('No pictures found.')
            // TODO add message on the UI or something else
            return;
        }
        for (let currentAscii of pictures) {
            let asciiPicture = currentAscii['data'];
            let isLiked = currentAscii['liked'];
            let likesCount = currentAscii['likes_count'];
            showAsciiPicture(wrapper, asciiPicture, isLiked, likesCount);
        }
    } else {
        // show error message
    }
}


// element => html element; asciiText => value attribute from PICTURES sql table
function showAsciiPicture(element, asciiPicture, isLiked, likesCount) {
    if (element && asciiPicture) {

        let nameEl = document.createElement('span');
        nameEl.style.fontWeight = 'bold';
        nameEl.innerHTML = 'Picture name: ' + asciiPicture['picture_name'];
        let updatedEl = document.createElement('span');
        updatedEl.style.fontWeight = 'bold';
        updatedEl.innerHTML = 'Last update on: ' + asciiPicture['updated_at'];
        element.appendChild(createAscciWrapperEl(asciiPicture));
        element.appendChild(nameEl);
        addLikeButton(element, asciiPicture['id'], isLiked, likesCount);
        element.appendChild(updatedEl);
    }
}

function createAscciWrapperEl(asciiPicture) {
    let responseAsciiValue = asciiPicture.value;
    let asciiColor = asciiPicture.color;
    let asciiText = responseAsciiValue.substring(1, responseAsciiValue.length - 1).replace(/\\n/g, '<br/>');
    asciiText = asciiText.replace('<br/>', '');
    let asciiWrapperElement = document.createElement('div');
    asciiWrapperElement.className = "ascii-wrapper";
    asciiWrapperElement.style.backgroundColor = 'white';
    let asciiTextElement = document.createElement("pre");
    asciiTextElement.className = "ascii-picture";
    asciiTextElement.style.color = asciiColor;
    asciiTextElement.innerHTML = asciiText;
    asciiWrapperElement.appendChild(asciiTextElement);
    return asciiWrapperElement;
}

function handleError(response) {
    console.log(response);
}


const USER_ID = 2;
const ASCII_NAME = "1";
const PAGINATION_PAGE = 0;
const PAGINATION_PAGESIZE = 10;

document.addEventListener("DOMContentLoaded", function (event) {
    // getAsciiText(USER_ID,ASCII_NAME); // get one ascii picture
    // getAllAsciiPictures(sessionStorage.getItem('user')); // get all ascii pictures
    // getAllFriendsPictures(USER_ID, PAGINATION_PAGE, PAGINATION_PAGESIZE); // get all friends ascii pictures with pagination
});



// Like button
function addLikeButton(el, pictureId, isLiked, likesCount) {
    let button = document.createElement('a');

    button.className = "button button-like";
    let i = document.createElement('i');
    i.classList.add('fa');
    i.classList.add('fa-heart');
    button.appendChild(i);
    let span = document.createElement('span');
    span.innerHTML = 'Like';
    let likesCountEl = document.createElement('span');
    likesCountEl.innerHTML = likesCount;
    likesCountEl.className = 'counter';
    let likedEl = document.createElement('span');
    likedEl.innerHTML = isLiked;
    likedEl.className = 'liked';
    likedEl.hidden = true;
    button.appendChild(span);
    button.appendChild(likesCountEl);
    button.appendChild(likedEl);
    button.addEventListener("click", function (e) {
        changeButtonView(button, pictureId);
        refreshCounter(button);
    });
    if (isLiked) {
        makeButtonLiked(button);
    }
    el.appendChild(button);
}


function addLike(pictureId) {
    var data = { 'user': sessionStorage.getItem('user'), 'picture': pictureId };
    sendRequest(`http://localhost:80/project-web-2022/ASCII-Art/server/page_controllers/feed/likes.php`,
        { method: "POST", data: JSON.stringify(data) },
        () => { },
        handleError,
    );
}

function deleteLike(pictureId) {
    var data = { 'user': sessionStorage.getItem('user'), 'picture': pictureId };
    sendRequest(`http://localhost:80/project-web-2022/ASCII-Art/server/page_controllers/feed/likes.php`,
        { method: "DELETE", data: JSON.stringify(data) },
        () => { },
        handleError,
    );
}

function makeButtonLiked(button) {
    button.style.color = 'green';
    button.style.fontWeight = 'bold';
    button.style.borderWidth = 'thick ';
    button.style.borderColor = 'green';
}

function makeButtonNotLiked(button) {
    button.style.color = 'grey';
    button.style.fontWeight = 'thin';
    button.style.borderWidth = 'thin';
    button.style.borderColor = 'grey';
}

function changeButtonView(button, pictureId) {
    console.log(button.getElementsByClassName('liked')[0]);
    let isLiked = button.getElementsByClassName('liked')[0].innerHTML;

    if (isLiked == 'true') {
        makeButtonNotLiked(button);
        deleteLike(pictureId);
        return;
    }
    makeButtonLiked(button);
    addLike(pictureId);
}

function refreshCounter(button) {
    let likesCount = parseInt(button.getElementsByClassName('counter')[0].innerHTML);
    console.log(likesCount);
    let isLiked = button.getElementsByClassName('liked')[0].innerHTML;
    if (isLiked == 'true') {
        likesCount -= 1;
        button.getElementsByClassName('liked')[0].innerHTML = false;
    }
    else {
        likesCount += 1;
        button.getElementsByClassName('liked')[0].innerHTML = true;
    }
    button.getElementsByClassName('counter')[0].innerHTML = likesCount;
}




// Pagination
function page(addition) {
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
    if (sessionStorage.getItem('current_section') == 'user-infor-img-section') {
        flush();
        getAllAsciiPictures(); return;
    }
    flushVideos();
    flush();
    getUserInfoVideos();
}

function updateButtonsMode(buttonClass, newMode) {
    var btns = document.getElementsByClassName(buttonClass);
    Array.from(btns).forEach(btn => { btn.disabled = newMode; });
}

function setupPages() {
    updateButtonsMode('prevPage', true);
    updateButtonsMode('nextPage', false);
    sessionStorage.setItem('page', 1);
}

function flush() {
    for (let i = 0; i < 2; i++) {
        var wrapper = document.getElementsByClassName("wrapper")[i];
        while (wrapper.firstChild) {
            wrapper.removeChild(wrapper.lastChild);
        }
    }
}

function flushVideos(){
    let videos = sessionStorage.getItem('videos');
    for (let index = 0; index < videos.length; index++) {
        clearTimeout(videos[index].timer);
        videos[index].current = 0;
    }
    sessionStorage.setItem('videos',[]);
    loaded_videos = [];
}

function getUserInfoVideos() {
    console.log(sessionStorage.getItem('owner'));
    sendRequest(`../../server/page_controllers/ascii-video-editor/get-videos.php?owner_id=${sessionStorage.getItem('owner')}&&page=${sessionStorage.getItem('page')}`, { method: 'GET', data: "" }, loadUserVideos, handleErrorAscii);
}

function loadUserVideos(response) {
    let videos = response["data"];
    if (videos.length < 10) {
        updateButtonsMode('nextPage', true);
    }

    deleteLoadedVideos();

    if (videos) {
        for (let i = 0; i < videos.length; i++) {
            let new_id = videos[i]["id"];
            let new_title = videos[i]["title"];
            let new_time = videos[i]["time_delay"];
            let new_color = videos[i]["color"];
            let new_background = videos[i]["background"];
            let new_frames = videos[i]["frames"];
            let new_name = `loaded_videos[${i}]`;

            let new_video = new Video(new_title, new_time, new_color, new_background, new_frames, new_id, new_name);

            new_video.addLabels();
            new_video.makeLoadedVideo();
            loaded_videos.push(new_video);
            loaded_videos[i].play();
        }
        sessionStorage.setItem('videos',loaded_videos);
    }
}

function deleteLoadedVideos() {
    let loaded_titles = document.getElementsByClassName("loaded-video-title");

    if (loaded_titles) {
        let length = loaded_titles.length;
        let section = document.getElementsByClassName("sections")[0];

        for (let i = 0; i < length; i++) {
            section.removeChild(loaded_titles[0]);
        }

        let loaded_videos_for_del = document.getElementsByClassName("loaded-video-frames")
        length = loaded_videos_for_del.length;

        for (let i = 0; i < length; i++) {
            section.removeChild(loaded_videos_for_del[0]);
        }
    }
}

function handleErrorAscii(response) {
    if (response["errors"]) {
        showModalForSeconds();
        modalContent.innerHTML = "An error has occurred. Try again."
    } else {
        document.getElementsByClassName("editor")[0].classList.remove("show-modal");
    }
}


const TEXT_ROWS = 41;
var loaded_videos = [];

class Video {


    constructor(title, time, color, background, frames, id, name) {
        this.title = title;
        this.time = time;
        this.color = color;
        this.background = background;
        this.frames = frames;
        this.frames_count = frames.length;
        this.id = id;
        this.current = 0;
        this.timer = 0;
        this.name = name;
    }

    addLabels() {
        let label = document.createElement("label");
        let title = document.createTextNode(this.title);

        label.setAttribute("class", "loaded-video-title");

        label.appendChild(title);

        let display_section = document.getElementById("videos-wrapper");

        display_section.appendChild(label);
    }

    makeLoadedVideo() {
        for (let i = 0; i < this.frames_count; i++) {
            var new_frame = document.createElement("textarea");
            new_frame.classList.add("loaded-video-frames", `video-frame-${this.id}`);
            new_frame.setAttribute("id", `loaded-frame-video-${this.id}-${i}`);
            new_frame.setAttribute("rows", TEXT_ROWS);
            new_frame.setAttribute("readonly", "");


            let text_value = this.frames[i];
            new_frame.appendChild(document.createTextNode(text_value));

            new_frame.style.color = this.color;
            new_frame.style.background = this.background;

            let section = document.getElementById("videos-wrapper");

            section.appendChild(new_frame);
        }

    }


    play() {
        let get_last = document.getElementById(`loaded-frame-video-${this.id}-${this.current}`);
        get_last.style.display = "none";

        if (this.current++ == this.frames.length - 1) {
            this.current = 0;
        }

        let get_next = document.getElementById(`loaded-frame-video-${this.id}-${this.current}`);
        get_next.style.display = "block";

        clearTimeout(this.timer);
        // console.log(this.timer);
        this.timer = setTimeout(this.name + '.play()', this.time);

    }

}