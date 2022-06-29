const hearts = {
    blue: "/infopane/res/blueheart.gif",
    red: "/infopane/res/redheart.gif",
    yellow: "/infopane/res/yellowheart.gif",
    silver: "/infopane/res/silverheart.gif",
    rainbow: "/infopane/res/rainbowheart.gif",
    cracked: "/infopane/res/fakeheart.gif",
    lunar: "/infopane/res/blackheart.gif"
}
const divisionTitles = {
    blue: "Blue Division",
    red: "Red Division",
    yellow: "Yellow Division",
    silver: "Silver Division",
    rainbow: "Rainbow Division",
    cracked: "Cracked Division",
    lunar: "Lunar Division"
}
var state = {}
var x = new WebSocket('ws://' + location.host);
x.addEventListener('open', function (event) {
    console.log("Opened Socket");
});
x.addEventListener('message', function (event) {
    console.debug("Message Recieved:", event);
    let message = JSON.parse(event.data);
    if (message.type === 'state') {
        updateState(message);
    }
    else if (message.type === 'system') {
        console.log("Recieved System Event: ", message.content)
    }
});

function updateState(newState) {
    if (state.currentHeart !== newState.currentHeart) {
        updateHeart(newState.currentHeart);
    }
    if (state.timer && state.timer !== newState.timer) {
        updateTimer(newState.timer);
    }
    state = newState;
}

function updateHeart(heart) {
    document.getElementById("heartImage").src = hearts[heart] || hearts.silver;
    document.getElementById("divisionheader").innerText = divisionTitles[heart] || '';
}

var timeInterval;

function updateTimer(timer) {
    let timeElement = document.getElementById("time")
    clearInterval(timeInterval);
    if (timer.isRunning && timer.endTime) {
        timeInterval = setInterval(() => {
            diff = (new Date(timer.endTime).getTime() - new Date().getTime()) / 1000
            if (diff <= 0) {
                timeElement.innerText = "00:00:00";
                clearInterval();
            }
            else {
                let hours = Math.floor(diff / 3600);
                let minutes = Math.floor(diff / 60) - (hours * 60);
                let seconds = Math.floor(diff % 60);
                timeElement.innerText = hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0')
            }
        }, 200);
    }
    else if (timer.duration) {
        let hours = Math.floor(timer.duration / 3600);
        let minutes = Math.floor(timer.duration / 60) - (hours * 60);
        let seconds = Math.floor(timer.duration % 60);
        timeElement.innerText = hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0')
    }
}