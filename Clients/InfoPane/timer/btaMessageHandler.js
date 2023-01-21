const hearts = {
    blue: "/infopane/res/blueheart.gif",
    red: "/infopane/res/redheart.gif",
    yellow: "/infopane/res/yellowheart.gif",
    silver: "/infopane/res/silverheart.gif",
    rainbow: "/infopane/res/rainbowheart.gif",
    cracked: "/infopane/res/fakeheart.gif",
    lunar: "/infopane/res/blackheart.gif",
    sapphire: "/infopane/res/sapphireheart.gif",
    ruby: "/infopane/res/rubyheart.gif",
    diamond: "/infopane/res/diamondheart.gif",
}
const divisionTitles = {
    blue: "Blue Division",
    red: "Red Division",
    yellow: "Yellow Division",
    silver: "Silver Division",
    rainbow: "Rainbow Division",
    cracked: "Cracked Division",
    lunar: "Lunar Division",
    sapphire: "Sapphire Division",
    ruby: "Ruby Division",
    diamond: "Diamond Division",
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

function numberPadAndSpan(number){
    let str = number.toString().padStart(2, '0');
    return '<span class="FWNum">'+ str.split('').join('</span><span class="FWNum">') + '</span>'
}

function getTimerString(totalSeconds){
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor(totalSeconds / 60) - (hours * 60);
    let seconds = Math.floor(totalSeconds % 60);
    let timeString = numberPadAndSpan(hours) + ":" + numberPadAndSpan(minutes) + ":" + numberPadAndSpan(seconds);
    return timeString;
}

function updateTimer(timer) {
    let timeElement = document.getElementById("time")
    clearInterval(timeInterval);
    if (timer.isRunning && timer.endTime) {
        timeInterval = setInterval(() => {
            diff = (new Date(timer.endTime).getTime() - new Date().getTime()) / 1000
            if (diff <= 0) {
                timeElement.innerHTML = getTimerString(0);
                clearInterval();
            }
            else {
                timeElement.innerHTML = getTimerString(diff);
            }
        }, 200);
    }
    else if (timer.duration) {
        timeElement.innerHTML = getTimerString(timer.duration);
    }
}