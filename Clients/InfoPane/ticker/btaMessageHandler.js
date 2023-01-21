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
    if (newState.matchups) {
        let matchups = [];
        for (let matchupInd in newState.matchups) {
            let matchup = newState.matchups[matchupInd];
            if (matchupInd != newState.activeMatchup && matchup && matchup.players && (matchup.players[0] || matchup.players[1])) {
                let matchupElement = document.createElement('div');
                matchupElement.className = "matchup";

                let matchupNames = document.createElement('p');
                matchupNames.className = "name";

                let matchupScore = document.createElement('p');
                matchupScore.className = "score";

                if(matchup.players[0] && matchup.players[1]){
                    matchupNames.innerText = matchup.players[0] + " v. " + matchup.players[1];
                    matchupScore.innerText = matchup.points[0] + "-" + matchup.points[1];
                }
                else{
                    matchupNames.innerText = matchup.players[0] || matchup.players[1];
                    matchupScore.innerText = "Bye";
                }

                matchupElement.appendChild(matchupNames);
                matchupElement.appendChild(matchupScore);

                matchups.push(matchupElement);
            }
        }
        let ticker = document.getElementById('ticker');
        ticker.innerHTML = "";
        matchups.forEach(x => ticker.appendChild(x))
    }
    state = newState;
}