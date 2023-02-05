var options_form = document.getElementById('video-options');
var new_frame_button = document.getElementById('new-frame');
var remove_frame_button = document.getElementById('remove-frame');
var make_video = document.getElementById('make-video');
var stop_video;
var number_of_frames = 0;
var times = document.getElementsByClassName("times");
var buttonToggleTime = document.getElementsByClassName("time-btn")[0];
const TEXT_ROWS = 41;
const TEXT_COLLS = 10;
const MAX_NUMBER_OF_FRAMES = 10;
var loaded_videos = [];
const BASE_URL = "../../server/page_controllers/";

var modal = document.getElementById("modal");
var modalContent = document.getElementsByClassName("modal-body")[0]
var modalCloseBtn = document.getElementsByClassName("close")[0];

function modalFunctionality() {

    modalCloseBtn.onclick = function () {
        modal.style.display = "none";
        document.getElementsByClassName("sections")[0].classList.remove("show-modal");
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            document.getElementsByClassName("sections")[0].classList.remove("show-modal");
        }
    }
}

function showModalForSeconds(reload = false) {
    document.getElementsByClassName("sections")[0].classList.add("show-modal");
    modal.style.display = "block";
    setTimeout(() => {
        document.getElementsByClassName("sections")[0].classList.remove("show-modal");
        modal.style.display = "none";
        if (reload) {
            window.location.href = "../../frontend/html/video_editor.html";
        }
    }, 2000);
}

getVideo(getParameters());
function getParameters() {
    const url = window.location.href;
    const urlObj = new URL(url);
    let search, searchParams;
    if (urlObj && urlObj.search) {
        search = urlObj.search.substring(1);
        searchParams = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
    }

    return searchParams;
}

function getVideo(params) {
    const jwtToken = getCookie("token");
    const owner_id = getUserIdFromJwtToken();
    let id = params["id"];

    if (owner_id && jwtToken) {

        sendRequest(
            `${BASE_URL}ascii-video-editor/get-video.php?owner_id=${owner_id}&id=${id}`,
            { method: "GET", data: '', token: jwtToken },
            displayVideo,
            handleErrorAscii,
        );
    }
}

function displayVideo(response) {

    let frames = response["data"][0]["frames"];
    for (let i = 0; i < frames.length; i++) {
        new_frame_button.click();
        let current_frame = document.getElementById(`frame${i + 1}`);
        current_frame.value = frames[i];
    }

    let loaded_title = response["data"][0]["title"];
    document.getElementById("ascii-name").value = loaded_title;
    Options_vid.title = loaded_title;
    Options_vid.id = response["data"][0]["id"];


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



function addedSuccessfully(response) {
    if (response["success"]) {
        showModalForSeconds(true);
        document.getElementsByClassName("modal-header")[0].style.backgroundColor = "#4BB543";
        document.getElementsByClassName("modal-body")[0].style.backgroundColor = "#ffffff";
        document.getElementsByClassName("modal-footer")[0].style.backgroundColor = "#4BB543";
        modalContent.innerHTML = "The video changes were successful.";
    } else {
        document.getElementsByClassName("modal-header")[0].style.backgroundColor = "#b54349";
        document.getElementsByClassName("modal-body")[0].style.backgroundColor = "#ffffff";
        document.getElementsByClassName("modal-footer")[0].style.backgroundColor = "#b54349";
        if (response["errors"]) {
            if (response["code"] == 23000) {
                showModalForSeconds();
                modalContent.innerHTML = "You already have a saved video with that name. Try again by changing the current name."
            } else {
                showModalForSeconds();
                modalContent.innerHTML = "An error has occured! Please try again!"
            }
        } else {
            document.getElementsByClassName("editor")[0].classList.remove("show-modal");
        }
    }
}


function handleErrorAscii(response) {
    if (response["errors"]) {
        showModalForSeconds();
        modalContent.innerHTML = "An error has occured!"
    } else {
        document.getElementsByClassName("editor")[0].classList.remove("show-modal");
    }
}

function saveVideo() {
    document.getElementsByClassName("ascii-form")[0].addEventListener("submit", function (event) {
        event.preventDefault();
        if (Options_vid.frames.length >= 2) {
            const jwtToken = getCookie("token");
            const userId = getUserIdFromJwtToken();
            if (userId && jwtToken) {
                const data = {};
                data["owner_id"] = userId;
                data["title"] = Options_vid.title;
                data["time"] = Options_vid.time;
                data["color"] = Options_vid.color;
                data["background"] = Options_vid.background;
                data["frames"] = Options_vid.frames;
                data["id"] = Options_vid.id;
                sendRequest(`${BASE_URL}ascii-video-editor/update-video.php`,
                    {
                        method: 'POST',
                        data: `data=${JSON.stringify(data)}`,
                        token: jwtToken
                    }, addedSuccessfully, handleErrorAscii);
            }
        }
        else {
            document.getElementsByClassName("modal-header")[0].style.backgroundColor = "#b54349";
            document.getElementsByClassName("modal-body")[0].style.backgroundColor = "#ffffff";
            document.getElementsByClassName("modal-footer")[0].style.backgroundColor = "#b54349";

            showModalForSeconds();
            modalContent.innerHTML = "Click the show video button first.";

        }
    });
}


function changeAsciiName() {
    document
        .getElementById("ascii-name")
        .addEventListener("change", function (event) {
            Options_vid.title = event.target.value;
        });
}

function autoPasteText(textarea) {
    textarea.addEventListener('click', async () => {
        try {
            let text = await navigator.clipboard.readText();
            if (text != "") {
                textarea.value = text;
                navigator.clipboard.writeText("");
            }
        } catch (error) {
            console.log("The clipboard was empty");
        }
    })
}

function addNewFrame() {

    new_frame_button.addEventListener("click", function () {
        if (number_of_frames < MAX_NUMBER_OF_FRAMES) {
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

function setColors() {
    document.getElementById("color").addEventListener("change", function (e) {
        frames = document.getElementsByClassName("frame");

        for (let i = 0; i < frames.length; i++) {
            frames[i].style.color = e.target.value;
            Options_vid.color = e.target.value;
        }
    })
}

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
    const START = 100;
    const END = 1400;
    const DIFF = 100;
    for (let i = START; i < END; i += DIFF) {
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

function chooseCharacter() {
    for (let i = 0; i < times.length; ++i) {
        times[i].addEventListener("click", function () {
            Options_vid.time = times[i].textContent;
            document.getElementsByClassName("time-btn")[0].innerHTML = Options_vid.time;
            document.getElementsByClassName("timers")[0].classList.toggle("open");
        });
    }
}

function changeAsciiName() {
    document.getElementById("ascii-name").addEventListener('change', function (event) {
        Options_vid.title = event.target.value;
    });
}

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

function stopVideo() {

    stop_video.addEventListener("click", function () {
        if (video_id) {
            clearTimeout(video_id);
        }
    })

}


function getAllAsciiPictures() {
    document.getElementById("load-pictures").addEventListener("click", function (event) {
        const jwtToken = getCookie("token");
        const userId = getUserIdFromJwtToken();
        if (userId && jwtToken) {
            sendRequest(
                `${BASE_URL}ascii-editor/getAllPictures.php?user=${userId}`,
                { method: "GET", data: '', token: jwtToken },
                displayAsciiPictures,
                handleErrorAscii,
            );
        }
    });
}

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

function displayAsciiPictures(response) {

    removeLoadedPictures();

    if (response["success"] && response[0]) {
        for (let currentAscii of response[0]) {
            let asciiPicture = currentAscii;
            let picture_section = document.getElementsByClassName("sections")[3];
            showAsciiPicture(picture_section, asciiPicture);
        }
        copyToClipboard();
    } else {
        document.getElementsByClassName("modal-header")[0].style.backgroundColor = "#b54349";
        document.getElementsByClassName("modal-body")[0].style.backgroundColor = "#ffffff";
        document.getElementsByClassName("modal-footer")[0].style.backgroundColor = "#b54349";

        showModalForSeconds();
        modalContent.innerHTML = "An error has occured! Please try again.";
    }
}


// element => html element; asciiText => value attribute from PICTURES sql table
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


function copyToClipboard() {
    let pictures = document.getElementsByClassName("ascii-picture");

    for (let i = 0; i < pictures.length; i++) {
        pictures[i].addEventListener('click', function (event) {
            let copied_text = pictures[i].innerHTML;
            navigator.clipboard.writeText(copied_text);
        });
    }
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

var scroll_timeout;
function scrollLeftRight() {
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
    getAllAsciiPictures(); // get all ascii pictures
    scrollLeftRight();

});