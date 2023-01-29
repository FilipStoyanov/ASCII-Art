var options_form = document.getElementById('video-options');
var new_frame_button = document.getElementById('new-frame');
var remove_frame_button = document.getElementById('remove-frame');
var make_video = document.getElementById('make-video');
var stop_video;
var times = document.getElementsByClassName("times");
var buttonToggleTime = document.getElementsByClassName("time-btn")[0];
const TEXT_ROWS = 41;
const TEXT_COLLS = 10;
var loaded_videos = [];
var number_of_frames = 0;   //MAYBE ADD THIS TO SESSION STORAGE?!!?

var modal = document.getElementById("modal");
var modalContent = document.getElementsByClassName("modal-body")[0]
var modalCloseBtn = document.getElementsByClassName("close")[0];


//modal things needs to be fixed
function modalFunctionality() {

    modalCloseBtn.onclick = function () {
        modal.style.display = "none";
        document.getElementsByClassName("sections")[0].classList.remove("show-modal");
        // window.location.reload();
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            document.getElementsByClassName("sections")[0].classList.remove("show-modal");
            // window.location.reload();
        }
    }
}

function showModalForSeconds(reload = false) {
    document.getElementsByClassName("sections")[0].classList.add("show-modal");
    modal.style.display = "block";
    setTimeout(() => {
        document.getElementsByClassName("sections")[0].classList.remove("show-modal");
        modal.style.display = "none";
        // if (reload) {
        //     window.location.reload();
        // }
    }, 2000);
}



class Options {


    constructor(title, time, color, background) {
        this.title = title;
        this.time = time;
        this.color = color;
        this.background = background;
        this.frames = [];
    }

    update_frames() {
        frames = document.getElementsByClassName("frame");

        for (let i = 0; i < frames.length; i++) {
            frames[i].style.color = this.color;
            frames[i].style.background = this.background;
        }

    }
}

var Options_vid = new Options("null", 2000, "#000000", "#ffffff");

// function sendRequest(url, options, successCallback, errorCallback) {
//     var request = new XMLHttpRequest();


//     request.onload = function () {
//         console.log(request.responseText);
//         var response = JSON.parse(request.responseText);

//         if (request.status === 200) {
//             successCallback(response);
//         } else {
//             console.log('Not authorized')
//             errorCallback(response);
//         }
//     }

//     request.open(options.method, url, true);
//     request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//     request.send(options.data);
// }

function addedSuccessfullyl(response) {
    if (response["success"]) {
        showModalForSeconds(true);
        document.getElementsByClassName("modal-header")[0].style.backgroundColor = "#4BB543";
        document.getElementsByClassName("modal-body")[0].style.backgroundColor = "#4BB543";
        modalContent.innerHTML = "Ascii видеото беше добавено успешно";
    } else {
        if (response["errors"]) {
            if (response["code"] == 23000) {
                showModalForSeconds();
                modalContent.innerHTML = "Вие имате запазена видео с това име. Моля, изберете друго име и опитайте отново."
            } else {
                showModalForSeconds();
                modalContent.innerHTML = "Възникна грешка! Моля опитайте отново."
            }
        } else {
            document.getElementsByClassName("editor")[0].classList.remove("show-modal");
        }
    }
}

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

        label.setAttribute("class", "frame-label");
        label.classList.add("loaded-video-title");


        label.appendChild(title);

        let display_section = document.getElementsByClassName("sections")[3];

        display_section.appendChild(label);
    }

    makeLoadedVideo() {
        var new_frame = document.createElement("textarea");
        new_frame.setAttribute("class", "loaded-video-frames");
        new_frame.setAttribute("id", `loaded-frame-video-${this.id}`);
        new_frame.setAttribute("rows", TEXT_ROWS);
        new_frame.setAttribute("readonly", "");


        let text_value = this.frames[0];
        new_frame.appendChild(document.createTextNode(text_value));

        new_frame.style.color = this.color;
        new_frame.style.background = this.background;

        let section = document.getElementsByClassName("sections")[3];

        section.appendChild(new_frame);

    }


    play() {
        if (this.current++ == this.frames.length - 1) {
            this.current = 0;
        }
        let video_element = document.getElementById(`loaded-frame-video-${this.id}`);
        video_element.innerHTML = this.frames[this.current];

        clearTimeout(this.timer);
        this.timer = setTimeout(this.name + '.play()', this.time);

    }

    addDeleteButton() {
        let delete_button = document.createElement("button");
        let context = document.createTextNode("Delete");
        delete_button.appendChild(context);

        delete_button.setAttribute("type", "button");
        delete_button.setAttribute("id", `delete-button-${this.id}`);
        delete_button.setAttribute("class", "menu-button");
        delete_button.classList.add("delete-button");


        let video_section = document.getElementsByClassName("sections")[3];

        video_section.appendChild(delete_button);

        let delete_video = document.getElementById(`delete-button-${this.id}`);

        var title = this.title;
        delete_video.addEventListener("click", function () {

            var data = {};
            const jwtToken = getCookie("token");
            const userId = getUserIdFromJwtToken();
            if (userId && jwtToken) {
                data["owner_id"] = userId;
                data["title"] = title;

                sendRequest(
                    "../../server/page_controllers/ascii-video-editor/delete-video.php",
                    {
                        method: "DELETE",
                        data: JSON.stringify(data),
                        token: jwtToken
                    },
                    deletedSuccessfully,
                    handleErrorAscii,
                );
            }
        })
    }

    addEditButton() {
        let edit_button = document.createElement("button");
        let context = document.createTextNode("Edit");
        edit_button.appendChild(context);

        edit_button.setAttribute("type", "button");
        edit_button.setAttribute("id", `edit-button-${this.id}`);
        edit_button.setAttribute("class", "menu-button");
        edit_button.classList.add("edit-button");


        let video_section = document.getElementsByClassName("sections")[3];

        video_section.appendChild(edit_button);

        let edit_video = document.getElementById(`edit-button-${this.id}`);

        var title = this.title;
        var id = this.id;
        edit_video.addEventListener("click", function () {

            var data = {};
            data["title"] = title;

            const url = `http://localhost/ASCII-Art/frontend/html/edit-video.html?id=${id}&title=${title}`;
            window.location.href = url;
        })
    }

}

function deletedSuccessfully(response) {
    if (response["success"]) {
        showModalForSeconds(true);
        document.getElementsByClassName("modal-header")[0].style.backgroundColor = "#4BB543";
        document.getElementsByClassName("modal-body")[0].style.backgroundColor = "#4BB543";
        modalContent.innerHTML = "Ascii видеото беше изтрито успешно";

        for (let i = 0; i < loaded_videos.length; i++) {
            clearTimeout(loaded_videos[i].timer);
        }

        document.getElementById("load-videos").click();
    } else {
        if (response["errors"]) {
            showModalForSeconds();
            modalContent.innerHTML = "Възникна грешка! Моля опитайте отново.";
        } else {
            document.getElementsByClassName("editor")[0].classList.remove("show-modal");
        }
    }
}

function deleteLoadedVideos() {
    let loaded_titles = document.getElementsByClassName("loaded-video-title");

    if (loaded_titles) {
        let length = loaded_titles.length;
        let section = document.getElementsByClassName("sections")[3];
        let delete_buttons = document.getElementsByClassName("delete-button");
        let edit_buttons = document.getElementsByClassName("edit-button");

        for (let i = 0; i < length; i++) {
            section.removeChild(loaded_titles[0]);
            section.removeChild(delete_buttons[0]);
            section.removeChild(edit_buttons[0]);
        }

        let loaded_videos_for_del = document.getElementsByClassName("loaded-video-frames")
        length = loaded_videos_for_del.length;

        for (let i = 0; i < length; i++) {
            section.removeChild(loaded_videos_for_del[0]);
        }

        loaded_videos = [];
    }
}

function loadUserVideos(response) {
    deleteLoadedVideos();
    if (response["data"]) {
        for (let i = 0; i < response["data"].length; i++) {
            let new_id = response["data"][i]["id"];
            let new_title = response["data"][i]["title"];
            let new_time = response["data"][i]["time_delay"];
            let new_color = response["data"][i]["color"];
            let new_background = response["data"][i]["background"];
            let new_frames = response["data"][i]["frames"];
            let new_name = `loaded_videos[${i}]`;

            let new_video = new Video(new_title, new_time, new_color, new_background, new_frames, new_id, new_name);

            new_video.addLabels();
            new_video.makeLoadedVideo();
            new_video.addDeleteButton();
            new_video.addEditButton();
            loaded_videos.push(new_video);
            loaded_videos[i].play();
        }
    } else {
        showModalForSeconds();
        modalContent.innerHTML = "Възникна грешка! Моля опитайте отново."
    }
}



function handleErrorAscii(response) {
    console.log(response);
    if (response["errors"]) {
        showModalForSeconds();
        modalContent.innerHTML = "Възникна грешка! Моля опитайте отново."
    } else {
        document.getElementsByClassName("editor")[0].classList.remove("show-modal");
    }
}

//save the currently displayed video
function saveVideo() {
    document.getElementsByClassName("ascii-form")[0].addEventListener("submit", function (event) {
        event.preventDefault();
        if (Options_vid.frames.length >= 2) {
            const jwtToken = getCookie("token");
            console.log("???");
            const userId = getUserIdFromJwtToken();
            if (userId && jwtToken) {
                const data = {};
                data["owner_id"] = userId;
                data["title"] = Options_vid.title;
                data["time"] = Options_vid.time;
                data["color"] = Options_vid.color;
                data["background"] = Options_vid.background;
                data["frames"] = Options_vid.frames;
                sendRequest('../../server/page_controllers/ascii-video-editor/save-video.php',
                    {
                        method: 'POST',
                        data: `data=${JSON.stringify(data)}`,
                        token: jwtToken
                    }, addedSuccessfullyl, handleErrorAscii);
            }
        }
    });
}

function getUserIdFromJwtToken() {
    const token = getCookie("token");
    let payload, userId;
    if (token) {
        payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.id;
    }
    return userId;
}

function loadVideos() {

    document.getElementById("load-videos").addEventListener("click", function (event) {
        event.preventDefault();
        const jwtToken = getCookie("token");
        const userId = getUserIdFromJwtToken();
        if (userId && jwtToken) {
            const data = {};
            data["owner_id"] = userId;
            sendRequest(`../../server/page_controllers/ascii-video-editor/get-videos.php?owner_id=${data["owner_id"]}`,
                { method: 'GET', data: "", token: jwtToken },
                loadUserVideos,
                handleErrorAscii
            );
        }
    });
}


//change the name of the ascii video
function changeAsciiName() {
    document
        .getElementById("ascii-name")
        .addEventListener("change", function (event) {
            Options_vid.title = event.target.value;
        });
}


//adds a new frame
function addNewFrame() {

    new_frame_button.addEventListener("click", function () {
        if (number_of_frames < 10) {
            number_of_frames++;
            let new_frame_label = document.createElement("label");
            let context = document.createTextNode(`Frame ${number_of_frames}`);

            new_frame_label.appendChild(context);
            new_frame_label.setAttribute("for", `frame${number_of_frames}`);
            new_frame_label.setAttribute("id", `frame-label-${number_of_frames}`);
            new_frame_label.setAttribute("class", "frame-label");

            var new_frame = document.createElement("textarea");
            new_frame.setAttribute("cols", TEXT_COLLS);
            new_frame.setAttribute("rows", TEXT_ROWS);
            new_frame.setAttribute("class", "frame");
            new_frame.setAttribute("id", `frame${number_of_frames}`);

            autoPasteText(new_frame);

            let frames = document.getElementById("frames");

            frames.insertBefore(new_frame_label, new_frame_button);
            frames.insertBefore(new_frame, new_frame_button);

        }
    })
}

//removes the last frame
function removeFrame() {
    remove_frame_button.addEventListener("click", function () {
        if (number_of_frames >= 1) {
            let label = document.getElementById(`frame-label-${number_of_frames}`);
            let textarea = document.getElementById(`frame${number_of_frames}`);

            label.remove();
            textarea.remove();
            number_of_frames--;
        }
    })
}

//makes the 'video'
function makeVideo() {
    make_video.addEventListener("click", function () {
        if (number_of_frames >= 1) {
            if (video_id) {
                clearTimeout(video_id);
            }

            let previous_video = document.getElementsByClassName("video-frames");
            if (previous_video) {
                let length = previous_video.length;
                for (let i = 0; i < length; i++) {
                    previous_video[0].remove();
                }
            }

            let length = Options_vid.frames.length;
            for (let i = 0; i < length; i++) {
                Options_vid.frames.pop();
            }


            var new_frame = document.createElement("textarea");
            new_frame.setAttribute("class", "video-frame");
            new_frame.setAttribute("id", `frame-video`);
            new_frame.setAttribute("class", "video-frames");
            new_frame.setAttribute("rows", TEXT_ROWS);
            new_frame.setAttribute("readonly", "");
            new_frame.style.color = Options_vid.color;
            new_frame.style.background = Options_vid.background;


            for (let i = 0; i < number_of_frames; i++) {
                let text_value = document.getElementById(`frame${i + 1}`).value;
                Options_vid.frames.push(text_value);

            }
            new_frame.appendChild(document.createTextNode(Options_vid.frames[0]));

            let video = document.getElementById("video");

            video.insertBefore(new_frame, make_video);
            showSlides();

            if (!stop_video) {
                stopButton();
            }
        }
    });
}

//TO DO PUT THESE IN THE SESSION STORAGE
let slideIndex = 0;
var video_id;

function showSlides() {
    let displayed_frame = document.getElementById("frame-video");

    slideIndex++;

    if (slideIndex > Options_vid.frames.length) {
        slideIndex = 1
    }
    displayed_frame.innerHTML = Options_vid.frames[slideIndex - 1];

    if (Options_vid) {
        video_id = setTimeout(showSlides, Options_vid.time);
    } else {
        video_id = setTimeout(showSlides, 2000);
    }

}

//change the color of the symbols of the frames
function setColors() {
    document.getElementById("color").addEventListener("change", function (e) {
        frames = document.getElementsByClassName("frame");

        for (let i = 0; i < frames.length; i++) {
            frames[i].style.color = e.target.value;
            Options_vid.color = e.target.value;
        }
    })
}

//change the background of the frames
function setBackgroundColor() {
    document.getElementById("background").addEventListener("change", function (e) {
        frames = document.getElementsByClassName("frame");

        for (let i = 0; i < frames.length; i++) {
            frames[i].style.background = e.target.value;
            Options_vid.background = e.target.value;
        }
    })
}

function addAsciiCharacters() {
    let times = document.getElementsByClassName("timers")[0];

    for (let i = 100; i < 1400; i += 100) {
        let time = document.createElement("button");
        time.classList.add("times");
        time.innerHTML = `${i}`;
        times.appendChild(time);
    }

}

function toggleAsciiCharacters() {
    buttonToggleTime.addEventListener("click", function () {
        document.getElementsByClassName("timers")[0].classList.toggle("open");
    });
}

//choose the speed of the video
function chooseCharacter() {
    for (let i = 0; i < times.length; ++i) {
        times[i].addEventListener("click", function () {
            Options_vid.time = times[i].textContent;
            document.getElementsByClassName("time-btn")[0].innerHTML = Options_vid.time;
            document.getElementsByClassName("timers")[0].classList.toggle("open");
        });
    }
}

//change the current video's name
function changeAsciiName() {
    document.getElementById("ascii-name").addEventListener('change', function (event) {
        Options_vid.title = event.target.value;
    });
}

//create the button for stopping the video
function stopButton() {
    let stop_button = document.createElement("button");
    let context = document.createTextNode("Stop");

    stop_button.appendChild(context);

    stop_button.setAttribute("type", "button");
    stop_button.setAttribute("id", "stop-button");
    stop_button.setAttribute("class", "menu-button");

    let video = document.getElementById("video");

    video.appendChild(stop_button);

    stop_video = document.getElementById("stop-button");

    stopVideo();
}

//stop the displayed video
function stopVideo() {
    stop_video.addEventListener("click", function () {
        if (video_id) {
            clearTimeout(video_id);
        }
    })
}


//send a request for the pictures
function getAllAsciiPictures() {
    //TO DO get the user id from session
    document.getElementById("load-pictures").addEventListener("click", function (event) {
        const jwtToken = getCookie("token");
        const userId = getUserIdFromJwtToken();
        if (userId && jwtToken) {
            sendRequest(
                `../../server/page_controllers/ascii-editor/getAllPictures.php?user=${userId}`,
                { method: "GET", data: '', token: jwtToken },
                displayAsciiPictures,
                handleErrorAscii,
            );
        }
    });
}


//remove previously loaded pictures
function removeLoadedPictures() {
    let loaded_pictures = document.getElementsByClassName("ascii-picture");

    if (loaded_pictures) {
        let length = loaded_pictures.length;
        let section = document.getElementsByClassName("sections")[4];

        for (let i = 0; i < length; i++) {
            section.removeChild(loaded_pictures[0]);
        }
    }
}

//what to do after the response
function displayAsciiPictures(response) {

    removeLoadedPictures();

    if (response["success"] && response[0]) {
        for (let currentAscii of response[0]) {
            let asciiPicture = currentAscii;
            let picture_section = document.getElementsByClassName("sections")[4];
            showAsciiPicture(picture_section, asciiPicture);
        }
        copyToClipboard();
    } else if (!response["success"]) {
        showModalForSeconds(true);
        document.getElementsByClassName("modal-header")[0].style.backgroundColor = "#4BB543";
        document.getElementsByClassName("modal-body")[0].style.backgroundColor = "#4BB543";
        modalContent.innerHTML = "Възникна грешка, моля опитайте отново!";
    }
}


//loard the users pictures
function showAsciiPicture(element, asciiPicture) {
    if (element && asciiPicture) {
        let responseAsciiValue = asciiPicture.value;
        let asciiColor = asciiPicture.color;
        let asciiText = responseAsciiValue.substring(2, responseAsciiValue.length - 1).replace(/\\n/g, '\n');
        let value_text_node = document.createTextNode(asciiText);
        let asciiTextElement = document.createElement("pre");

        asciiTextElement.setAttribute("class", "ascii-picture");
        asciiTextElement.style.color = asciiColor;
        asciiTextElement.appendChild(value_text_node);

        element.appendChild(asciiTextElement);
    }
}

const ASCII_NAME = "1";
const PAGINATION_PAGE = 0;
const PAGINATION_PAGESIZE = 10;

//copy picture to clipboard
function copyToClipboard() {
    let pictures = document.getElementsByClassName("ascii-picture");

    for (let i = 0; i < pictures.length; i++) {
        pictures[i].addEventListener('click', function (event) {
            let copied_text = pictures[i].innerHTML;
            navigator.clipboard.writeText(copied_text);
        });
    }
}

//paste the text
function autoPasteText(textarea) {
    textarea.addEventListener('click', async () => {
        try {
            let text = await navigator.clipboard.readText();
            textarea.value = text;
            navigator.clipboard.writeText("");
        } catch (error) {
            console.log("The clipboard was empty");
        }
    })
}

//Left and Right navigaion
function scrollLeftRight() {
    var scroll_timeout;
    var left = document.getElementById("left");
    var right = document.getElementById("right");
    let body = document.body;

    left.addEventListener("mousedown", function (e) {
        scroll_timeout = setInterval(function () {
            body.scrollLeft -= 10;
        })
    });

    left.addEventListener("mouseup", function (e) {
        if (body.scrollLeft == 0) {
            left.style.display = "none";
        }

        if (body.scrollLeft != body.scrollWidth - body.clientWidth) {
            right.style.display = "block";
        }
        clearInterval(scroll_timeout);
    });

    right.addEventListener("mousedown", function (e) {
        scroll_timeout = setInterval(function () {
            body.scrollLeft += 10;
        })
    });

    right.addEventListener("mouseup", function (e) {
        if (document.body.scrollLeft != 0) {
            left.style.display = "block"
        }
        let int_scrollLeft = parseInt(body.scrollLeft, 10);
        if (int_scrollLeft + 1 >= body.scrollWidth - body.clientWidth) {
            right.style.display = "none";
        }
        clearInterval(scroll_timeout);
    });
}

document.addEventListener("DOMContentLoaded", function (event) {
    addNewFrame();
    removeFrame();
    makeVideo();
    setColors();
    setBackgroundColor();
    addAsciiCharacters();
    toggleAsciiCharacters();
    chooseCharacter();
    changeAsciiName();
    saveVideo();
    modalFunctionality();
    loadVideos();
    getAllAsciiPictures(); // get all ascii pictures
    scrollLeftRight();

});