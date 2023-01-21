var state = {}
var x = new WebSocket('ws://' + location.host);

const colors = {
    sapphire: "#2f52fa",
    ruby: "#b80b26",
    diamond: "#b6b6b6",
}
const root = document.querySelector(':root');

const p1 = document.getElementById('p1');
const p2 = document.getElementById('p2');
const score = document.getElementById('score')

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

function clearMatch() {
    p1.innerText = "";
    p2.innerText = "";
    score.innerText = "";
}
function updateState(newState) {
    if (state.currentHeart != newState.currentHeart) {
        root.style.setProperty('--bg-color', colors[newState.currentHeart] || "#FFF");
    }
    if (newState.activeMatchup >= 0 && newState.matchups[newState.activeMatchup]) {
        let matchup = newState.matchups[newState.activeMatchup];
        if (matchup.players[0] || matchup.players[1]) {
            p1.innerText = matchup.players[0] || 'Bye';
            p2.innerText = matchup.players[1] || 'Bye';
            if (matchup.players[0] && matchup.players[1]) {
                score.innerText = matchup.points[0] + '-' + matchup.points[1];
            }
            else {
                score.innerText = "";
            }
        }
        else { clearMatch() }
    }
    else { clearMatch() }
    state = newState;
}