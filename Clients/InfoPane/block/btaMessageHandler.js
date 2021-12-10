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
    loser.innerHTML = "";
    if(newState.loser >= 0 && newState.players.length > newState.loser){
        let p = document.createElement('p');
        p.innerText = newState.players[newState.loser];
        loser.appendChild(p);
    }
    state = newState;
}