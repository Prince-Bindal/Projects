console.log("Let's get started already")
let currentSong = new Audio();
let songs;
let currentFolder = "songs/ncs"; // Your folder path

function formatTime(seconds) {
    // Ensure seconds is a valid number
    seconds = Number(seconds) || 0;

    // Convert to whole number of seconds
    seconds = Math.floor(seconds);

    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;

    // Pad both minutes and seconds with leading zeros
    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(secs).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Fetch songs from your local server
async function getSongs(folder) {
    currentFolder = folder;
    try {
        let a = await fetch(`/${folder}/`)
        let response = await a.text();


        let div = document.createElement("div")
        div.innerHTML = response;
        let as = div.getElementsByTagName("a")
        songs = []

        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                // Extract just the filename - get the text content instead of href
                let filename = element.textContent.trim();
                // Remove any path separators (\ or /)
                filename = filename.split(/[\\\/]/).pop();
                if (filename.endsWith(".mp3")) {
                    songs.push(filename);
                }
            }
        }



        // If no songs found, try alternative parsing
        if (songs.length === 0) {
            console.log("Trying alternative parsing method...");
            // Parse the raw text to find filenames
            let lines = response.split('\n');
            for (let line of lines) {
                if (line.includes('.mp3')) {
                    // Extract filename using regex - match everything up to .mp3
                    let match = line.match(/([^\\\/]+\.mp3)/);
                    if (match) {
                        songs.push(match[1]);
                    }
                }
            }

        }

        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

const playMusic = (track, pause = false) => {
    // Build the correct URL
    currentSong.src = `/${currentFolder}/${encodeURIComponent(track)}`


    if (!pause) {
        currentSong.play()
        play.src = "/img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00/00:00"

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]

    songUL.innerHTML = ""; // Clear existing content

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                                    </ src="/img/music.svg" alt="">
                                    <div class="info">
                                        <div>${song}</div>
                                        <div>Monarch</div>
                                    </div>
                                    <div class="playnow">
                                        <span>Playnow</span>
                                        <img class="invert" src="/img/play.svg" alt="">
                                    </div> </li>`;
    }

    // Attach an eventlistener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();

            playMusic(songName);
        })
    })
}
async function displayAlbums() {
    try {
        let a = await fetch(`/songs/`)
        let response = await a.text();
        let div = document.createElement("div")
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a")
        let cardContainer = document.querySelector(".cardContainer")
        
        if (!cardContainer) {
            console.error('Card container not found!');
            return;
        }
        
        let array = Array.from(anchors)
        
        // Clear existing cards to avoid duplicates
        cardContainer.innerHTML = '';
        
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
            // Decode URL to handle Windows backslashes (%5C)
            let decodedHref = decodeURIComponent(e.href);
            
            // Check for both /songs/ and \songs\ (Windows compatibility)
            if ((decodedHref.includes("/songs/") || decodedHref.includes("\\songs\\")) && decodedHref.endsWith("/")) {
                // Extract folder name - normalize backslashes to forward slashes
                let folder = decodedHref.replace(/\\/g, '/').split("/").filter(x => x).pop();
                
                try {
                    // Get the metadata of the folder
                    let metaResponse = await fetch(`/songs/${folder}/info.json`)
                    
                    if (!metaResponse.ok) {
                        continue;
                    }
                    
                    let metadata = await metaResponse.json();
                    
                    cardContainer.innerHTML += `<div data-folder="songs/${folder}" class="card">
                                <div class="play">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34">
                                        <circle cx="12" cy="12" r="12" fill="#1ed760" />
                                        <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="black" />
                                    </svg>
                                </div>
                                <img src="/songs/${folder}/cover.jpeg" alt="${metadata.title}">
                                <h3>${metadata.title}</h3>
                                <p>${metadata.description}</p>
                            </div>`;
                    
                } catch (error) {
                    // Skip folders that don't have valid info.json
                    continue;
                }
            }
        }

        // Load the playlist whenever card is clicked
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(item.currentTarget.dataset.folder)
                playMusic(songs[0])
            })
        })
        
    } catch (error) {
        console.error('Error loading albums:', error);
    }
}

async function main() {

    // Get the list of all the songs from server
    // Change "songs/ncs" to whatever folder structure you have
    await getSongs("songs/ncs")

    //display all the albums on the page
    await displayAlbums()


    // Check if any songs were found
    if (songs.length === 0) {
        console.error("No songs found! Please check:");
        console.log("1. Server is running");
        console.log("2. Folder path is correct: songs/ncs");
        console.log("3. Directory listing is enabled");
        alert("No songs found! Check console for details.");
        return;
    }

    playMusic(songs[0], true)



    // Attach an event listener to play/pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "/img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "/img/play.svg"
        }
    })

    // Listen for time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an eventListener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add a event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add a event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous 
    previous.addEventListener("click", () => {

        let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songs.indexOf(currentFile);

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next 
    next.addEventListener("click", () => {

        let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songs.indexOf(currentFile);

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an eventListener to volume
  // Add this code to your script.js - Replace the existing volume event listeners

// Volume slider functionality
const volumeSlider = document.querySelector(".range input");
const volumePopup = document.getElementById("volumePopup");
const volumeRange = document.querySelector(".volume .range");
const volumeIcon = document.querySelector(".volume > img");

let volumeTimeout;
let hideTimeout;

// Toggle volume slider on icon click
volumeIcon.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent event bubbling
    
    // Toggle mute/unmute functionality
    if (e.target.src.includes("/img/volume.svg")) {
        // Don't mute, just show the slider
        toggleVolumeSlider();
    } else if (e.target.src.includes("/img/mute.svg")) {
        // Unmute
        e.target.src = e.target.src.replace("/img/mute.svg", "/img/volume.svg");
        currentSong.volume = 0.50;
        volumeSlider.value = 50;
        toggleVolumeSlider();
    }
});

// Function to toggle volume slider visibility
function toggleVolumeSlider() {
    clearTimeout(hideTimeout);
    
    if (volumeRange.classList.contains("show")) {
        // Hide the slider
        volumeRange.classList.remove("show");
    } else {
        // Show the slider
        volumeRange.classList.add("show");
        
        // Auto-hide after 3 seconds
        hideTimeout = setTimeout(() => {
            volumeRange.classList.remove("show");
        }, 3000);
    }
}

// Volume slider input event
volumeSlider.addEventListener("input", (e) => {
    const volumeValue = parseInt(e.target.value);
    currentSong.volume = volumeValue / 100;
    
    // Update icon based on volume
    if (volumeValue === 0) {
        volumeIcon.src = "/img/mute.svg";
    } else {
        volumeIcon.src = "/img/volume.svg";
    }
    
    // Show popup
    volumePopup.textContent = `Volume: ${volumeValue}%`;
    volumePopup.classList.add("show");
    
    // Hide popup after 1.2 seconds
    clearTimeout(volumePopup.timeout);
    volumePopup.timeout = setTimeout(() => {
        volumePopup.classList.remove("show");
    }, 1200);
    
    // Reset the auto-hide timer for the slider
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
        volumeRange.classList.remove("show");
    }, 3000);
});

// Keep slider visible while hovering/interacting
volumeRange.addEventListener("mouseenter", () => {
    clearTimeout(hideTimeout);
});

volumeRange.addEventListener("mouseleave", () => {
    hideTimeout = setTimeout(() => {
        volumeRange.classList.remove("show");
    }, 2000);
});

// Hide slider when clicking outside
document.addEventListener("click", (e) => {
    if (!e.target.closest(".volume")) {
        volumeRange.classList.remove("show");
    }
});

// Optional: Keyboard shortcuts for volume
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && volumeRange.classList.contains("show")) {
        e.preventDefault();
        const newVolume = Math.min(100, parseInt(volumeSlider.value) + 5);
        volumeSlider.value = newVolume;
        currentSong.volume = newVolume / 100;
        volumePopup.textContent = `Volume: ${newVolume}%`;
        volumePopup.classList.add("show");
        setTimeout(() => volumePopup.classList.remove("show"), 1200);
    } else if (e.key === "ArrowDown" && volumeRange.classList.contains("show")) {
        e.preventDefault();
        const newVolume = Math.max(0, parseInt(volumeSlider.value) - 5);
        volumeSlider.value = newVolume;
        currentSong.volume = newVolume / 100;
        volumePopup.textContent = `Volume: ${newVolume}%`;
        volumePopup.classList.add("show");
        setTimeout(() => volumePopup.classList.remove("show"), 1200);
    }
});

    // Optional: Auto-play next song when current ends
    currentSong.addEventListener("ended", () => {
        let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songs.indexOf(currentFile);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add eventlistener to volume button to mute
    document.querySelector(".volume > img").addEventListener("click", e => {


        if (e.target.src.includes("/img/volume.svg")) {
            e.target.src = e.target.src.replace("/img/volume.svg", "/img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("/img/mute.svg", "/img/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;

        }
    })



}

main()