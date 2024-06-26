var state = {}
var x = new WebSocket('ws://' + location.host);

const divisionTitles = {
    blue: "Blue Division",
    red: "Red Division",
    yellow: "Yellow Division",
    silver: "Silver Division",
    rainbow: "Rainbow Division",
    cracked: "Cracked Division",
    lunar: "Lunar Division"
}

x.addEventListener('open', function (event) {
    console.log("Opened Socket");
});
x.addEventListener('message', function (event) {
    console.debug("Message Recieved:", event);
    let message = JSON.parse(event.data);
    if (message.type === 'state') {
        updateState(message);
    } else if (message.type === 'system') {
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
            div.className = "player";
            let p = document.createElement('p');
            p.innerText = player;
            p.innerText = p.innerText.replace(/ /g, '\u00a0') //NBSP
            div.appendChild(p);
            let isChamp = newState.info.champions.includes(player);
            if (!isSpecialPlayer(player) && !isChamp) {
                let infoLine = document.createElement('p');
                infoLine.className = "playerinfoline";
                infoLine.innerHTML = `<img class="berry icon" src="/infopane/res/strawberry.png"/>\u2060<span class="times">\u00D7</span>${newState.points[player]|0}`+(isChamp ? '' : `<img class="berry icon" src="/infopane/res/cs_assistmode.png"/>\u2060<span class="times">\u00D7</span>${newState.redeems[player]|0}`);
                div.appendChild(infoLine);
            }
            let bg = document.createElement('div');
            bg.className = "box";
            div.appendChild(bg);
            if (isChamp) {
                div.classList.add('champ');
                div.classList.add('special');
            }
            if (idx !== newState.loser) {
                nodes.push(div)
            } else {
                div.classList.add('loser');
                if (isSpecialPlayer(player)) {
                    div.classList.add('special');
                }
                losernode = div;
            }
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