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

        let display_section = document.getElementsByClassName("sections")[0];

        display_section.appendChild(label);
    }

    makeLoadedVideo() {
        for (let i = 0; i < this.frames_count; i++) {
            var new_frame = document.createElement("textarea");
            new_frame.setAttribute("class", "loaded-video-frames");
            new_frame.classList.add("class", `video-frame-${this.id}`);
            new_frame.setAttribute("id", `loaded-frame-video-${this.id}-${i}`);
            new_frame.setAttribute("rows", TEXT_ROWS);
            new_frame.setAttribute("readonly", "");


            let text_value = this.frames[i];
            new_frame.appendChild(document.createTextNode(text_value));

            new_frame.style.color = this.color;
            new_frame.style.background = this.background;

            let section = document.getElementsByClassName("sections")[0];

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

function loadUserVideos(response) {
    // console.log(response);
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
            loaded_videos.push(new_video);
            loaded_videos[i].play();
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

function loadVideos() {

    document.getElementById("load-videos").addEventListener("click", function (event) {
        var data = {};
        data["owner_id"] = 1;

        sendRequest(`../../server/page_controllers/ascii-video-editor/get-videos.php?owner_id=${data["owner_id"]}`, { method: 'GET', data: "" }, loadUserVideos, handleErrorAscii);
        event.preventDefault();
    });
}

document.addEventListener("DOMContentLoaded", function(event) {
    loadVideos();
})
