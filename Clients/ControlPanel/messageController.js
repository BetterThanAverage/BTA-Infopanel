var x = new WebSocket('ws://'+location.host);
var state = {};
x.addEventListener('open', function (event) {
    console.log("Opened Socket");
});
x.addEventListener('message', function (event) {
    console.debug("Message Recieved:", event);
    let message = JSON.parse(event.data);
    if(message.type === 'state'){
        updateState(message);
    }
    if(message.type==='system'){
        console.log("Recieved System Event: ", message.content)
    }
});

function updateState(newState){
    if(state.players != newState.players){
        let nodes = [];
        let idx = 0;
        newState.players.forEach(player => {
            if(idx !== newState.loser){
                let div = document.createElement('div');
                let span = document.createElement('span');
                span.innerText = player;
                div.appendChild(span);
                let loseButton = document.createElement('button');
                loseButton.type = 'button';
                loseButton.innerText = 'Lost';
                loseButton.value = idx;
                loseButton.onclick = () => markLoss(loseButton.value);
                let removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.innerText = '🗑️';
                removeButton.value = idx;
                removeButton.onclick = () => removePlayer(removeButton.value);
                div.appendChild(loseButton);
                div.appendChild(removeButton);
                nodes.push(div)
            }
            idx ++;
        });
        let playerNode = document.getElementById('players');
        playerNode.innerHTML = '';
        nodes.forEach(node => playerNode.appendChild(node));
    }
    let loser = document.getElementById('loser')
    loser.innerHTML = "";
    if(newState.loser >= 0 && newState.players.length > newState.loser){
        let div = document.createElement('div');
        let p = document.createElement('p');
        p.innerText = newState.players[newState.loser];
        div.appendChild(p);
        let unloseButton = document.createElement('button');
        unloseButton.type = 'button';
        unloseButton.innerText = 'Unlose';
        unloseButton.onclick = () => markLoss(-1);
        let removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.innerText = '🗑️';
        removeButton.value = newState.loser;
        removeButton.onclick = () => removeLast(removeButton.value);
        div.appendChild(unloseButton);
        div.appendChild(removeButton);
        loser.appendChild(div);
    }
    state = newState;
}

function sendUpdateHeart(heart){
    x.send(JSON.stringify({type: "updateHeart", content: heart}))
}

function addPlayer(){
    let adder = document.getElementById('playeradder');
    if(adder.value){
        x.send(JSON.stringify({type: "addPlayer", content: adder.value}))
        adder.value = '';
    }
}

function removeLast(index){
    x.send(JSON.stringify({type: "removePlayer", content: index}));
    x.send(JSON.stringify({type: "losePlayer", content: -1}));
}

function removePlayer(index){
    x.send(JSON.stringify({type: "removePlayer", content: index}));
}

function markLoss(index){
    x.send(JSON.stringify({type: "losePlayer", content: index}));
}

function triggerPrelims(){
    x.send(JSON.stringify({type: "triggerPrelims"}));
}
function triggerFinals(){
    x.send(JSON.stringify({type: "triggerFinals"}));
}
