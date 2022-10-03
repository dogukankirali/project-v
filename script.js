const playPauseBtn = document.querySelector(".play-pause-btn")
const theaterBtn = document.querySelector(".theater-btn")
const fullScreenBtn = document.querySelector(".fullscreen-btn")
const miniPlayerBtn = document.querySelector(".mini-player-btn")
const muteBtn = document.querySelector(".mute-btn")
const captionsBtn = document.querySelector(".captions-btn")
const speedBtn = document.querySelector(".speed-btn")
const currentTimeElem = document.querySelector(".current-time")
const totalTimeElem = document.querySelector(".total-time")
const previewImg = document.querySelector(".preview-img")
const thumbnailImg = document.querySelector(".thumbnail-img")
const volumeSlider = document.querySelector(".volume-slider")
const videoContainer = document.querySelector(".video-container")
const timelineContainer = document.querySelector(".timeline-container")
const shadowContainer = document.querySelector(".shadow-overlay")
const plusBtn = document.querySelector(".plus")
const plusText = document.querySelector(".plus-inside-text")
const minusBtn = document.querySelector(".minus")
const minusText = document.querySelector(".minus-inside-text")
const video = document.querySelector("video")

document.addEventListener("keydown", e => {
    const tagName = document.activeElement.tagName.toLowerCase()

    if (tagName === "input") return
    switch (e.key.toLowerCase()) {
        case " ":
            if (tagName === "button") return
        case "k":
            togglePlay()
            break
        case "f":
            toggleFullScreenMode()
            break
        case "t":
            toggleTheaterMode()
            break
        case "i":
            toggleMiniPlayerMode()
            break
        case "m":
            toggleMute()
            break
        case "arrowdown":
            changeVolume(-0.05);
            break;
        case "arrowup":
            changeVolume(0.05);
            break;
        case "arrowleft":
        case "j":
            skip(-5)
            break
        case "arrowright":
        case "l":
            skip(5)
            break
        case "c":
            toggleCaptions()
            break
        case "1":
            setToTime(1)
            break
        case "2":
            setToTime(2)
            break
        case "3":
            setToTime(3)
            break
        case "4":
            setToTime(4)
            break
        case "5":
            setToTime(5)
            break
        case "6":
            setToTime(6)
            break
        case "7":
            setToTime(7)
            break
        case "8":
            setToTime(8)
            break
        case "9":
            setToTime(9)
            break
        case "0":
            setToTime(0)
            break
    }
})

async function getVideo() {
    await axios.get('http://localhost:8080/video')
        .then(resp => {
            console.log(typeof(resp.data))
        })
        .catch(error => console.error(error));
};

getVideo()

for (let e of document.querySelectorAll('input[type="range"].volume-slider')) {
    e.style.setProperty('--value', e.value);
    e.style.setProperty('--min', e.min == '' ? '0' : e.min);
    e.style.setProperty('--max', e.max == '' ? '100' : e.max);
    e.addEventListener('input', () => e.style.setProperty('--value', e.value));
}

// Timeline
timelineContainer.addEventListener("mousemove", handleTimelineUpdate)
timelineContainer.addEventListener("mousedown", toggleScrubbing)
document.addEventListener("mouseup", e => {
    if (isScrubbing) toggleScrubbing(e)
})
document.addEventListener("mousemove", e => {
    if (isScrubbing) handleTimelineUpdate(e)
})

let isScrubbing = false
let wasPaused
function toggleScrubbing(e) {
    const rect = timelineContainer.getBoundingClientRect()
    const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
    isScrubbing = (e.buttons & 1) === 1
    videoContainer.classList.toggle("scrubbing", isScrubbing)
    if (isScrubbing) {
        wasPaused = video.paused
        video.pause()
    } else {
        video.currentTime = percent * video.duration
        if (!wasPaused) video.play()
    }

    handleTimelineUpdate(e)
}

function handleTimelineUpdate(e) {
    const rect = timelineContainer.getBoundingClientRect()
    const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
    const previewImgNumber = Math.max(
        1,
        Math.floor((percent * video.duration) / 10)
    )
    const previewImgSrc = `assets/previewImgs/preview${previewImgNumber}.jpg`
    previewImg.src = previewImgSrc
    timelineContainer.style.setProperty("--preview-position", percent)

    if (isScrubbing) {
        e.preventDefault()
        thumbnailImg.src = previewImgSrc
        timelineContainer.style.setProperty("--progress-position", percent)
    }
}

// Playback Speed
speedBtn.addEventListener("click", changePlaybackSpeed)

function changePlaybackSpeed() {
    let newPlaybackRate = video.playbackRate + 0.25
    if (newPlaybackRate > 2) newPlaybackRate = 0.25
    video.playbackRate = newPlaybackRate
    speedBtn.textContent = `${newPlaybackRate}x`
}

// Captions
const captions = video.textTracks[0]
captions.mode = "hidden"

captionsBtn.addEventListener("click", toggleCaptions)

function toggleCaptions() {
    const isHidden = captions.mode === "hidden"
    captions.mode = isHidden ? "showing" : "hidden"
    videoContainer.classList.toggle("captions", isHidden)
}

// Duration
video.addEventListener("loadeddata", () => {
    totalTimeElem.textContent = formatDuration(video.duration)
})

video.addEventListener("timeupdate", () => {
    currentTimeElem.textContent = formatDuration(video.currentTime)
    const percent = video.currentTime / video.duration
    timelineContainer.style.setProperty("--progress-position", percent)
})

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
})
function formatDuration(time) {
    const seconds = Math.floor(time % 60)
    const minutes = Math.floor(time / 60) % 60
    const hours = Math.floor(time / 3600)
    if (hours === 0) {
        return `${minutes}:${leadingZeroFormatter.format(seconds)}`
    } else {
        return `${hours}:${leadingZeroFormatter.format(
            minutes
        )}:${leadingZeroFormatter.format(seconds)}`
    }
}

function setToTime(number) {
    if (number === 0) {
        video.currentTime = 0;
    } else {
        video.currentTime = Math.floor((video.duration / 10) * number)
    }
}

let durationCounter = 0

function skip(duration) {
    durationCounter += duration
    video.currentTime += duration

    document.addEventListener("keyup", (event) => {
        if (event.key.toLowerCase() === "arrowright" || event.key.toLowerCase() === "arrowleft") {
            durationCounter = 0
        }
    })

    shadowContainer.style.setProperty("opacity", 1)
    if (Math.sign(duration) === 1) {
        plusText.textContent = `+${durationCounter}`
        plusBtn.style.setProperty("display", "flex")
    } else if (Math.sign(duration) === -1) {
        minusText.textContent = `-${durationCounter * -1}`
        minusBtn.style.setProperty("display", "flex")
    }
    setTimeout(() => {
        shadowContainer.style.setProperty("opacity", 0)
        plusBtn.style.setProperty("display", "none")
        minusBtn.style.setProperty("display", "none")
        plusText.textContent = ``
        minusText.textContent = ``
    }, 200)
}

// Volume
muteBtn.addEventListener("click", toggleMute)
volumeSlider.addEventListener("input", e => {
    video.volume = e.target.value
    video.muted = e.target.value === 0
})

function toggleMute() {
    video.muted = !video.muted
}

function changeVolume(value) {
    if (video.volume <= 0.05 && Math.sign(value) === -1) {
        video.volume = 0;
    } else if (video.volume === 1 && Math.sign(value) === 1) {
        return;
    } else {
        video.volume += value;
    }
}

video.addEventListener("volumechange", () => {
    volumeSlider.value = video.volume
    let volumeLevel
    if (video.muted || video.volume === 0) {
        volumeSlider.value = 0
        volumeLevel = "muted"
    } else if (video.volume >= 0.5) {
        volumeLevel = "high"
    } else {
        volumeLevel = "low"
    }

    videoContainer.dataset.volumeLevel = volumeLevel
})

// View Modes
theaterBtn.addEventListener("click", toggleTheaterMode)
fullScreenBtn.addEventListener("click", toggleFullScreenMode)
miniPlayerBtn.addEventListener("click", toggleMiniPlayerMode)

function toggleTheaterMode() {
    videoContainer.classList.toggle("theater")
}

function toggleFullScreenMode() {
    if (document.fullscreenElement == null) {
        videoContainer.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
}

function toggleMiniPlayerMode() {
    if (videoContainer.classList.contains("mini-player")) {
        document.exitPictureInPicture()
    } else {
        video.requestPictureInPicture()
    }
}

document.addEventListener("fullscreenchange", () => {
    videoContainer.classList.toggle("full-screen", document.fullscreenElement)
})

video.addEventListener("enterpictureinpicture", () => {
    videoContainer.classList.add("mini-player")
})

video.addEventListener("leavepictureinpicture", () => {
    videoContainer.classList.remove("mini-player")
})

video.addEventListener("dblclick", toggleFullScreenMode)

// Play/Pause
playPauseBtn.addEventListener("click", togglePlay)
video.addEventListener("click", togglePlay)

function togglePlay() {
    video.paused ? video.play() : video.pause()
}

video.addEventListener("play", () => {
    videoContainer.classList.remove("paused")
})

video.addEventListener("pause", () => {
    videoContainer.classList.add("paused")
})