const dir = '../../';
const baseUrl = dir + 'server/page_controllers/';
const userInfoUrl = baseUrl + 'users/userInfo.php';
const allPicturesUrl = baseUrl + 'ascii-editor/getUserPictures.php';
const videoEditorUrl = baseUrl + 'ascii-video-editor/';

window.addEventListener("load", (event) => {
    setupPages();
    getUserInfo();
    openTab(event, 'user-info-img-section');
});
function openTab(event, sectionName) {
    if (sessionStorage.getItem('owner') === null && getCookie('token') === null) {
        errorMsg.style.display = "block";
        errorMsg.innerHTML = 'User is not chosen or there is an error with the permissions.';
        return;
    }
    var errorMsg = document.getElementById("error-msg");
    errorMsg.style.display = "";

    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    if (event.currentTarget != window) {
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove("active");
        }
    }
    document.getElementById(sectionName).style.display = "block";
    event.currentTarget.className += " active";

    sessionStorage.setItem('current_section', sectionName);

    if (sectionName == 'user-info-img-section') {
        document.getElementsByClassName("wrapper")[0].innerHTML = "";
        getAllAsciiPictures();
        return;
    }
    getUserInfoVideos();
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
            setCookie('token', response["token"], 30);
            successCallback(response);
        } else if (request.status == 401 || request.status == 403) {
            setCookie('token', token, 30);
            errorCallback(response, true);
        }
        else {
            setCookie('token', token, 30);
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

function getUserInfo() {
    var url = userInfoUrl + '?user=' + sessionStorage.getItem('owner');
    sendRequestWithHeaders(url, { method: 'GET', data: '' }, handleUserInfo, handleError);
}



function handleUserInfo(response) {
    var userNameEl = document.getElementsByClassName('user-info-title')[0];
    userNameEl.innerHTML = `<span>Username:</span> ${response['user']['username']}`;
}


var wrapper = document.getElementsByClassName("wrapper")[0];

function getAllAsciiPictures() {
    sendRequestWithHeaders(
        allPicturesUrl + `?owner=${sessionStorage.getItem('owner')}&&page=${sessionStorage.getItem('page')}`,
        { method: "GET", data: '' },
        displayAsciiPictures,
        handleError,
    );
}

function displayAsciiPictures(response) {
    const notFoundText = document.getElementsByClassName("not-found")[0];
    const pagination = document.getElementsByClassName("button-wrapper")[0];
    if (response["success"] && response['pictures']) {
        var wrapper = document.getElementsByClassName("wrapper")[0];
        let pictures = response['pictures'];
        if (pictures.length < 10) {
            notFoundText.style.display = "none";
            pagination.style.display = "flex";
            updateButtonsMode('nextPage', true);
        }
        if (pictures.length == 0) {
            console.log('No pictures found.');
            notFoundText.style.display = "block";
            pagination.style.display = "none";
            return;
        }
        for (let currentAscii of pictures) {
            let asciiPicture = currentAscii['data'];
            let isLiked = currentAscii['liked'];
            let likesCount = currentAscii['likes_count'];
            showAsciiPicture(wrapper, asciiPicture, isLiked, likesCount);
        }
    }
}


function showAsciiPicture(element, asciiPicture, isLiked, likesCount) {
    if (element && asciiPicture) {
        let nameEl = document.createElement('span');
        let wrapper = document.createElement('div');
        nameEl.style.fontWeight = 'bold';
        nameEl.innerHTML = 'Picture name: ' + asciiPicture['picture_name'];
        nameEl.style.fontSize = "20px";
        let updatedEl = document.createElement('span');
        updatedEl.style.fontWeight = 'bold';
        updatedEl.innerHTML = 'Last update on: ' + asciiPicture['updated_at'];
        let asciiItemElement = createAscciWrapperEl(asciiPicture);
        let asciiFooter = document.createElement("div");
        asciiFooter.classList.add("ascii-footer");
        wrapper.appendChild(nameEl);
        asciiFooter.appendChild(wrapper);
        addLikeButton(asciiFooter, asciiPicture['id'], isLiked, likesCount);
        wrapper = document.createElement("div");
        wrapper.appendChild(updatedEl);
        asciiFooter.appendChild(wrapper);
        asciiItemElement.appendChild(asciiFooter);
        element.appendChild(asciiItemElement);
    }
}

function createAscciWrapperEl(asciiPicture) {
    let responseAsciiValue = asciiPicture.value;
    let asciiColor = asciiPicture.color;
    let asciiText = responseAsciiValue.substring(2, responseAsciiValue.length - 1).replace(/\\n/g, '<br/>');
    console.log(asciiText);
    let asciiWrapperElement = document.createElement('div');
    asciiWrapperElement.className = "ascii-wrapper";
    let asciiTextElement = document.createElement("pre");
    asciiTextElement.className = "ascii-picture";
    asciiTextElement.style.color = asciiColor;
    asciiTextElement.style.backgroundColor = "#ffffff";
    asciiTextElement.innerHTML = asciiText;
    asciiWrapperElement.appendChild(asciiTextElement);
    return asciiWrapperElement;
}


const USER_ID = 2;
const ASCII_NAME = "1";
const PAGINATION_PAGE = 0;
const PAGINATION_PAGESIZE = 10;



function addLikeButton(el, pictureId, isLiked, likesCount) {
    let button = document.createElement('a');
    button.className = "button button-like";
    let span = document.createElement('span');
    span.innerHTML = '\u2764';
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
    var data = { 'picture': pictureId };
    sendRequestWithHeaders(`../../server/page_controllers/feed/likes.php`,
        { method: "POST", data: JSON.stringify(data) },
        () => { },
        handleError,
    );
}

function deleteLike(pictureId) {
    var data = { 'picture': pictureId };
    sendRequestWithHeaders(`../../server/page_controllers/feed/likes.php`,
        { method: "DELETE", data: JSON.stringify(data) },
        () => { },
        handleError,
    );
}

function makeButtonLiked(button) {
    button.style.color = 'red';
    button.style.fontWeight = 'bold';
    button.style.borderWidth = 'thick ';
    button.style.borderColor = 'red';
}

function makeButtonNotLiked(button) {
    button.style.color = 'grey';
    button.style.fontWeight = 'thin';
    button.style.borderWidth = 'thin';
    button.style.borderColor = 'grey';
}

function changeButtonView(button, pictureId) {
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
    if (sessionStorage.getItem('current_section') == 'user-info-img-section') {
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
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const userId = urlParams.get('user');
    sessionStorage.setItem('owner', userId);
}

function flush() {
    for (let i = 0; i < 2; i++) {
        var wrapper = document.getElementsByClassName("wrapper")[i];
        while (wrapper.firstChild) {
            wrapper.removeChild(wrapper.lastChild);
        }
    }
}

function flushVideos() {
    let videos = sessionStorage.getItem('videos');
    for (let index = 0; index < videos.length; index++) {
        clearTimeout(videos[index].timer);
        videos[index].current = 0;
    }
    sessionStorage.setItem('videos', []);
    loaded_videos = [];
}

function getUserInfoVideos() {
    sendRequestWithHeaders(videoEditorUrl + `get-user-videos.php?owner_id=${sessionStorage.getItem('owner')}&&page=${sessionStorage.getItem('page')}`, { method: 'GET', data: "" }, loadUserVideos, handleError);
}

function loadUserVideos(response) {
    const notFoundText = document.getElementsByClassName("not-found")[1];
    const pagination = document.getElementsByClassName("button-wrapper")[1];
    let videos = response["data"];

    if (videos.length == 0) {
        notFoundText.style.display = "block";
        pagination.style.display = "none";
        return;
    }

    if (videos.length < 10) {
        updateButtonsMode('nextPage', true);
        notFoundText.style.display = "none";
        pagination.style.display = "flex";
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
            let updated_at = videos[i]['updated_at'];
            let new_name = `loaded_videos[${i}]`;

            let new_video = new Video(new_title, new_time, new_color, new_background, new_frames, new_id, new_name, updated_at);
            var asciiWrapperElement = document.createElement("div");
            asciiWrapperElement.className = "ascii-wrapper";
            asciiWrapperElement.setAttribute("id", `${videos[i]["id"]}`);
            let videoWrapper = document.getElementsByClassName("wrapper")[1];
            videoWrapper.appendChild(asciiWrapperElement);
            document.getElementsByClassName("wrapper")[1].appendChild(asciiWrapperElement);
            new_video.makeLoadedVideo();
            new_video.addLabels();
            loaded_videos.push(new_video);
            loaded_videos[i].play();
        }
        sessionStorage.setItem('videos', loaded_videos);
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
    Array.from(tabcontents).forEach(tabcontent => { tabcontent.classList.add("show-modal"); });
    setTimeout(() => {
        Array.from(tabcontents).forEach(tabcontent => { tabcontent.classList.remove("show-modal"); });
        if (reload) {
            window.location.reload();
        }
    }, 3000);
}


const TEXT_ROWS = 41;
var loaded_videos = [];

class Video {


    constructor(title, time, color, background, frames, id, name, updated_at) {
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
        this.updated_at = updated_at;
    }

    addLabels() {
        let label = document.createElement("label");
        label.setAttribute("class", "loaded-video-title");

        let nameEl = document.createElement('span');
        let asciiWrapperElement = document.getElementById(this.id);
        let wrapper = document.createElement('div');
        nameEl.style.fontWeight = 'bold';
        nameEl.innerHTML = 'Video name: ' + this.title;
        nameEl.style.fontSize = "20px";
        let updatedEl = document.createElement('span');
        updatedEl.style.fontWeight = 'bold';
        updatedEl.innerHTML = 'Last update on: ' + this.updated_at;
        let asciiFooter = document.createElement("div");
        asciiFooter.classList.add("ascii-footer");
        wrapper.appendChild(nameEl);
        asciiFooter.appendChild(wrapper);

        wrapper = document.createElement("div");
        asciiFooter.appendChild(wrapper);
        wrapper = document.createElement("div");
        wrapper.appendChild(updatedEl);
        asciiFooter.appendChild(wrapper);
        asciiWrapperElement.appendChild(asciiFooter);

        asciiWrapperElement.appendChild(label);
    }

    makeLoadedVideo() {
        var new_frame = document.createElement("textarea");
        new_frame.setAttribute("class", "loaded-video-frames");
        new_frame.setAttribute("id", `loaded-frame-video-${this.id}`);
        new_frame.setAttribute("rows", TEXT_ROWS);
        new_frame.style.width = '100%';
        new_frame.readOnly = true;
        new_frame.style.resize = 'none';
        new_frame.style.border = 'none';
        new_frame.setAttribute("readonly", "");


        let text_value = this.frames[0];
        new_frame.appendChild(document.createTextNode(text_value));

        new_frame.style.color = this.color;
        new_frame.style.background = this.background;

        let asciiWrapperElement = document.getElementById(this.id);
        asciiWrapperElement.appendChild(new_frame);
    }


    play() {
        if (this.current++ == this.frames.length - 1) {
            this.current = 0;
        }
        let video_element = document.getElementById(`loaded-frame-video-${this.id}`);
        if(video_element && this.frames && this.frames[this.current]) {
            video_element.innerHTML = this.frames[this.current];
        }

        clearTimeout(this.timer);
        this.timer = setTimeout(this.name + '.play()', this.time);

    }

}