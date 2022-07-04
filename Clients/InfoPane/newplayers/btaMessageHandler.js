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
    if(state.players != newState.players || state.points != newState.points || state.loser !== newState.loser){
        let nodes = [];
        let losernode;
        let idx = 0
        newState.players.forEach(player => {
            let div = document.createElement('div');
            div.className = "player";
            let p = document.createElement('p');
            p.innerText = player;
            if(player !== 'PRELIMS' && player !== 'FINALS')
                p.innerText += ` 🍓\u2060x${newState.points[player]|0}`
            p.innerText = p.innerText.replace(/ /g, '\u00a0')//NBSP
            div.appendChild(p);
            let bg = document.createElement('div');
            bg.className = "box";
            div.appendChild(bg);
            if(idx !== newState.loser){
                nodes.push(div)
            }
            else{
                div.className = "player loser"
                losernode = div;
            }
            idx++;
        });
        let playerNode = document.getElementById('players');
        playerNode.innerHTML = '';
        if(losernode){
            playerNode.appendChild(losernode);
        }
        nodes.forEach(node => playerNode.appendChild(node));
    }
    state = newState;
}