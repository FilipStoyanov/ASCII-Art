var options_form = document.getElementById('video-options');
var new_frame_button = document.getElementById('new-frame');
var remove_frame_button = document.getElementById('remove-frame');
var make_video = document.getElementById('make-video');
var stop_video;
var number_of_frames = 1;


class Options {
    constructor(title, time, transition, color, background) {
        this.title = title;
        this.time = time;
        this.transition = transition;
        this.color = color;
        this.background = background;
    }

    update_frames() {
        frames = document.getElementsByClassName("frame");

        for (let i = 0; i < frames.length; i++) {
            frames[i].style.color = this.color;
            frames[i].style.background = this.background;
        }

    }
}

var Options_vid;

function submitOptionsForm() {

    if (options_form) {
        options_form.addEventListener("submit", function (event) {
            let formTitle = document.getElementById("video-title").value;
            let formTime = document.getElementById("time").value;
            let formTransition = document.getElementById("transition").value;
            let formColor = document.getElementById("color").value;
            let formBackground = document.getElementById("background").value;

            Options_vid = new Options(formTitle, formTime, formTransition, formColor, formBackground);
            Options_vid.update_frames();

            console.log(Options_vid);
            event.preventDefault();
        });
    }
}

function addNewFrame() {

    new_frame_button.addEventListener("click", function () {
        number_of_frames++;
        let new_frame_label = document.createElement("label");
        let context = document.createTextNode(`Frame ${number_of_frames}`);

        new_frame_label.appendChild(context);
        new_frame_label.setAttribute("for", `frame${number_of_frames}`);
        new_frame_label.setAttribute("id", `frame-label-${number_of_frames}`);

        var new_frame = document.createElement("textarea");
        new_frame.setAttribute("cols", 10);
        new_frame.setAttribute("rows", 5);
        new_frame.setAttribute("class", "frame");
        new_frame.setAttribute("id", `frame${number_of_frames}`);

        let frames = document.getElementById("frames");

        frames.insertBefore(new_frame_label, new_frame_button);
        frames.insertBefore(new_frame, new_frame_button);

    })
}

function removeFrame() {
    if (number_of_frames >= 1) {
        remove_frame_button.addEventListener("click", function () {
            let label = document.getElementById(`frame-label-${number_of_frames}`);
            let textarea = document.getElementById(`frame${number_of_frames}`);

            label.remove();
            textarea.remove();
            number_of_frames--;
        })
    }
}

function makeVideo() {
    if (number_of_frames >= 1) {
        make_video.addEventListener("click", function () {
            if (video_id) {
                clearTimeout(video_id);
            }

            let previous_video = document.getElementsByClassName("mySlides");
            if (previous_video) {
                let length = previous_video.length;
                for (let i = 0; i < length; i++) {
                    previous_video[0].remove();
                }
            }

            for (let i = 0; i < number_of_frames; i++) {

                var new_frame = document.createElement("div");
                new_frame.setAttribute("class", "video-frame");
                new_frame.setAttribute("id", `frame-video-${i + 1}`);
                new_frame.setAttribute("class", "mySlides");

                new_frame.appendChild(document.createTextNode(document.getElementById(`frame${i + 1}`).value));

                let video = document.getElementById("video");

                video.insertBefore(new_frame, make_video);
            }
            showSlides();

            if (!stop_video) {
                stopButton();
            }
        });
    }
}

let slideIndex = 0;
var video_id;

function showSlides() {
    let i;
    let slides = document.getElementsByClassName("mySlides");

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    slideIndex++;

    if (slideIndex > slides.length) {
        slideIndex = 1
    }
    slides[slideIndex - 1].style.display = "block";

    if(Options_vid){
        video_id = setTimeout(showSlides, Options_vid.time);
    }else{
        video_id = setTimeout(showSlides, 2000);
    }

}

function stopButton() {
    let stop_button = document.createElement("button");
    let context = document.createTextNode("Stop");

    stop_button.appendChild(context);

    stop_button.setAttribute("type", "button");
    stop_button.setAttribute("id", "stop-button");

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
    submitOptionsForm();
    addNewFrame();
    removeFrame();
    makeVideo();
    // stopVideo();
});