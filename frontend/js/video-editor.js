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
var loaded_videos = [];

var modal = document.getElementById("modal");
// modal.style.display = "none";
var modalContent = document.getElementsByClassName("modal-body")[0]
var modalCloseBtn = document.getElementsByClassName("close")[0];

function modalFunctionality() {

    modalCloseBtn.onclick = function () {
        console.log("AA");
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

getVideo(getParameters());
function getParameters() {
    const url = window.location.href;
    const urlObj = new URL(url);
    let search, searchParams;
    if (urlObj && urlObj.search) {
        search = urlObj.search.substring(1);
        searchParams = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
    }

    console.log(searchParams["id"]);
    return searchParams;
}

function getVideo(params) {
    //get onwer from session
    let owner_id = 1;
    let id = params["id"];

    sendRequest(
        `../../server/page_controllers/ascii-video-editor/get-video.php?owner_id=${owner_id}&id=${id}`,
        { method: "GET", data: '' },
        displayVideo,
        handleErrorAscii,
    );
}

function displayVideo(response) {
//LOAD THE FRAMES HERE
    console.log(response);
    // removeLoadedPictures();

    // if (response["success"] && response[0]) {
    //     for (let currentAscii of response[0]) {
    //         let asciiPicture = currentAscii;
    //         let picture_section = document.getElementsByClassName("sections")[4];
    //         showAsciiPicture(picture_section, asciiPicture);
    //     }
    //     copyToClipboard();
    // } else {
    //     // show error message
    // }
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

var Options_vid = new Options("null", 2000, "#ffffff", "#000000");

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

function addedSuccessfully(response) {
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


function handleErrorAscii(response) {
    if (response["errors"]) {
        showModalForSeconds();
        modalContent.innerHTML = "Възникна грешка! Моля опитайте отново."
    } else {
        document.getElementsByClassName("editor")[0].classList.remove("show-modal");
    }
}

function saveVideo() {

    document.getElementsByClassName("ascii-form")[0].addEventListener("submit", function (event) {
        if (Options_vid.frames.length >= 2) {
            sendRequest('../../server/page_controllers/ascii-video-editor/save-video.php', { method: 'POST', data: `data=${JSON.stringify(Options_vid)}` }, addedSuccessfully, handleErrorAscii);
        }
        event.preventDefault();
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
            textarea.value = text;
        } catch (error) {
            console.log("The clipboard was empty");
        }
    })
}

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

            for (let i = 0; i < number_of_frames; i++) {

                var new_frame = document.createElement("textarea");
                new_frame.setAttribute("class", "video-frame");
                new_frame.setAttribute("id", `frame-video-${i + 1}`);
                new_frame.setAttribute("class", "video-frames");
                new_frame.setAttribute("rows", TEXT_ROWS);
                new_frame.setAttribute("readonly", "");

                let text_value = document.getElementById(`frame${i + 1}`).value;
                new_frame.appendChild(document.createTextNode(text_value));

                Options_vid.frames.push(text_value);

                new_frame.style.color = Options_vid.color;
                new_frame.style.background = Options_vid.background;

                let video = document.getElementById("video");

                video.insertBefore(new_frame, make_video);
            }
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
    let i;
    let slides = document.getElementsByClassName("video-frames");

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    slideIndex++;

    if (slideIndex > slides.length) {
        slideIndex = 1
    }
    slides[slideIndex - 1].style.display = "block";

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

document.addEventListener("DOMContentLoaded", function (event) {
    // submitOptionsForm();
    addNewFrame();
    removeFrame();
    makeVideo();
    setColors();
    setBackgroundColor();
    // stopVideo();
    addAsciiCharacters();
    toggleAsciiCharacters();
    chooseCharacter();
    changeAsciiName();
    saveVideo();
    modalFunctionality();
    getAllAsciiPictures(USER_ID); // get all ascii pictures

});

function getAllAsciiPictures(ownerId) {
    document.getElementById("load-pictures").addEventListener("click", function (event) {
        sendRequest(
            `../../server/page_controllers/ascii-editor/getAllPictures.php?user=${ownerId}`,
            { method: "GET", data: '' },
            displayAsciiPictures,
            handleErrorAscii,
        );
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
            let picture_section = document.getElementsByClassName("sections")[4];
            showAsciiPicture(picture_section, asciiPicture);
        }
        copyToClipboard();
    } else {
        // show error message
    }
}


// element => html element; asciiText => value attribute from PICTURES sql table
function showAsciiPicture(element, asciiPicture) {
    if (element && asciiPicture) {
        // console.log(asciiPicture);
        let responseAsciiValue = asciiPicture.value;
        // console.log(responseAsciiValue);
        // console.log(value_text_node);
        let asciiColor = asciiPicture.color;
        let asciiText = responseAsciiValue.substring(1, responseAsciiValue.length - 1).replace(/\\n/g, '\n');
        // asciiText = asciiText.replace('<br/>', '');
        // console.log(asciiText);
        // asciiText = asciiText.replace('\n', '<br/>');
        // console.log("????");
        // console.log(asciiText);
        let value_text_node = document.createTextNode(asciiText);
        // let asciiWrapperElement = document.createElement('div');
        // asciiWrapperElement.className = "ascii-wrapper";
        let asciiTextElement = document.createElement("pre");
        asciiTextElement.setAttribute("class", "ascii-picture");
        // asciiTextElement.className = "ascii-picture";
        asciiTextElement.style.color = asciiColor;
        asciiTextElement.appendChild(value_text_node);
        // asciiTextElement.innerHTML = responseAsciiValue;
        // asciiWrapperElement.appendChild(asciiTextElement);
        element.appendChild(asciiTextElement);
    }
}

const USER_ID = "1";
const ASCII_NAME = "1";
const PAGINATION_PAGE = 0;
const PAGINATION_PAGESIZE = 10;

function copyToClipboard() {
    let pictures = document.getElementsByClassName("ascii-picture");

    for (let i = 0; i < pictures.length; i++) {
        pictures[i].addEventListener('click', function (event) {
            let copied_text = pictures[i].innerHTML;
            console.log(pictures[i].innerHTML);
            navigator.clipboard.writeText(copied_text);
        });
    }
}