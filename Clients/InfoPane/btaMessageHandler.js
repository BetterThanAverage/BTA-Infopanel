const hearts = {
    blue: "res/blueheart.gif",
    red: "res/redheart.gif",
    yellow: "res/yellowheart.gif",
    silver: "res/silverheart.gif",
    rainbow: "res/rainbowheart.gif",
    cracked: "res/fakeheart.gif"
}
var state = {}
var x = new WebSocket('ws://'+location.host);
x.addEventListener('open', function (event) {
    console.log("Opened Socket");
});
x.addEventListener('message', function (event) {
    console.debug("Message Recieved:", event);
    let message = JSON.parse(event.data);
    if(message.type === 'state'){
        updateState(message);
    }
    else if(message.type === 'system'){
        console.log("Recieved System Event: ", message.content)
    }
});

function updateState(newState){
    if(state.currentHeart !== newState.currentHeart){
        updateHeart(newState.currentHeart);
    }
    if(state.players != newState.players){
        let nodes = [];
        let idx = 0
        newState.players.forEach(player => {
            if(idx !== newState.loser){
                let p = document.createElement('p');
                p.innerText = player;
                nodes.push(p)
            }
            idx++;
        });
        let playerNode = document.getElementById('players');
        playerNode.innerHTML = '';
        nodes.forEach(node => playerNode.appendChild(node));
    }
    let loser = document.getElementById('loser')
    loser.innerHTML = "";
    if(newState.loser >= 0 && newState.players.length > newState.loser){
        let p = document.createElement('p');
        p.innerText = newState.players[newState.loser];
        loser.appendChild(p);
    }
    state = newState;
}

function updateHeart(heart){
    document.getElementById("heartImage").src = hearts[heart] || hearts.silver
}