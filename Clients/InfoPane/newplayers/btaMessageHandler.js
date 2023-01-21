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

function isSpecialPlayer(playerName) {
    return playerName === 'PRELIMS' || playerName === 'FINALS' || playerName === 'SUDDEN DEATH'
}

function updateState(newState) {
    if (state.players != newState.players || state.points != newState.points || state.loser !== newState.loser) {
        let nodes = [];
        let losernode;
        let idx = 0
        newState.players.forEach(player => {
            let div = document.createElement('div');
            div.className = "player special";
            let p = document.createElement('p');
            p.innerText = player;
            p.innerText = p.innerText.replace(/ /g, '\u00a0')//NBSP
            div.appendChild(p);
            let bg = document.createElement('div');
            bg.className = "box";
            div.appendChild(bg);
            nodes.push(div)
            idx++;
        });
        let playerNode = document.getElementById('players');
        playerNode.innerHTML = '';
        if (losernode) {
            playerNode.appendChild(losernode);
        }
        nodes.forEach(node => playerNode.appendChild(node));
    }
    state = newState;
}