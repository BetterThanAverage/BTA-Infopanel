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
    let loser = document.getElementById('loser')
    let blocktext = document.getElementById('blocktext')
    loser.innerHTML = "";
    if(newState.loser >= 0 && newState.players.length > newState.loser){
        let p = document.createElement('p');
        let player = newState.players[newState.loser];
        p.innerText = player;
        if(newState.points[player] && newState.points[player] > 0)
            p.innerText += ` (+${newState.points[player] * 5} secs)`
        if(newState.points[player] && newState.points[player] < 0)
            p.innerText += ` (${newState.points[player] * 5} secs)`
        loser.appendChild(p);
        if(player === "PRELIMS" || player === "FINALS"){
            blocktext.innerText = "ㅤ";
        }
        else{
            blocktext.innerText = "On the Block";
        }
    }
    state = newState;
}