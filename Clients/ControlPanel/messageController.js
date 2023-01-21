var x = new WebSocket('ws://' + location.host);
var state = {};
x.addEventListener('open', function (event) {
    console.log("Opened Socket");
});
x.addEventListener('message', function (event) {
    console.debug("Message Recieved:", event);
    let message = JSON.parse(event.data);
    if (message.type === 'state') {
        updateState(message);
    }
    if (message.type === 'system') {
        console.log("Recieved System Event: ", message.content)
    }
});

function isSpecialPlayer(playerName) {
    return playerName === 'PRELIMS' || playerName === 'FINALS' || playerName === 'SUDDEN DEATH'
}

function setSeed(seed, player) {
    x.send(JSON.stringify({ type: "setSeed", content: [seed, player] }));
}

function renderBracket(state) {
    let bracketNode = document.getElementById("bracket");
    bracketNode.innerHTML = '';

    let currentBracket = state.info.brackets[state.players.length + ''];
    if (currentBracket) {
        for (let roundNum in currentBracket) {
            let column = document.createElement('div');
            column.className = "bracketColumn"

            let header = document.createElement('p');
            header.innerText = `Round ${roundNum}`;
            column.appendChild(header);

            let matchups = currentBracket[roundNum];
            for(let matchupInd in matchups){
                let pair = document.createElement('div');
                pair.className = "matchupPair";

                let pairHeader = document.createElement('p');
                pairHeader.className = "matchupHeader";
                pairHeader.innerText = `Bracket #${parseInt(matchupInd)+1}`
                pair.appendChild(pairHeader);

                let matchup = matchups[matchupInd];
                if(matchup.length === 1){
                    let bye = document.createElement('p');
                    bye.className = "matchupPlayer";
                    let matchupTarget = matchup[0];
                    if(roundNum === '1'){
                        bye.innerText = state.seeds[matchupTarget] || `Seed #${matchupTarget}`
                    }
                    else{
                        bye.innerText = null || `Winner of Bracket ${matchupTarget+1}`
                    }

                    pair.appendChild(bye);
                }
                else {
                    let p1 = document.createElement('p');
                    p1.className = "matchupPlayer";
                    let matchupTarget = matchup[0];
                    if(roundNum === '1'){
                        p1.innerText = state.seeds[matchupTarget] || `Seed #${matchupTarget}`
                    }
                    else{
                        p1.innerText = null || `Winner of Bracket ${matchupTarget+1}`
                    }
                    let p2 = document.createElement('p');
                    p2.className = "matchupPlayer";
                    matchupTarget = matchup[1];
                    if(roundNum === '1'){
                        p2.innerText = state.seeds[matchupTarget] || `Seed #${matchupTarget}`
                    }
                    else{
                        p2.innerText = null || `Winner of Bracket ${matchupTarget+1}`
                    }

                    pair.appendChild(p1);
                    pair.appendChild(p2);
                }

                let plusButton = document.createElement('button');
                plusButton.type = 'button';
                plusButton.innerText = '1 +1';
                pair.appendChild(plusButton);
                let plus2Button = document.createElement('button');
                plus2Button.type = 'button';
                plus2Button.innerText = '2 +1';
                pair.appendChild(plus2Button);
                let winButton = document.createElement('button');
                winButton.type = 'button';
                winButton.innerText = '1 W';
                pair.appendChild(winButton);
                let win2Button = document.createElement('button');
                win2Button.type = 'button';
                win2Button.innerText = '2 W';
                pair.appendChild(win2Button);

                column.appendChild(pair);
            }

            bracketNode.appendChild(column);
        }
    }
}

function setPlayer(playerName, playerInd, brackInd){
    x.send(JSON.stringify({type: "addPlayerToMatch", content: [playerName, playerInd, brackInd]}))
}

function updateState(newState) {
    if (state.players != newState.players) {
        let playerNodes = [];
        let seedNodes = [];
        newState.players.forEach((player, idx) => {
            let playercard = document.createElement('div');
            playercard.className = "playercard";

            //#region funfact
            if (newState.info?.players[player]?.fun) {
                playercard.title = newState.info.players[player].fun
            }
            //#endregion funfact

            //#region header
            let playerheader = document.createElement('div');
            playerheader.className = "header";

            //#region title
            let playertitle = document.createElement('div');
            playertitle.className = "title";

            //#region name
            let name = document.createElement('p');
            name.innerText = player;
            playertitle.appendChild(name);
            //#endregion name

            playerheader.appendChild(playertitle);
            //#endregion title

            //#region stats
            if (!isSpecialPlayer(player)) {
                let playerstats = document.createElement('div');
                playerstats.className = "stats";

                playerheader.appendChild(playerstats);
            }
            //#endregion stats

            playercard.appendChild(playerheader);
            //#endregion header

            //#region text
            let cardtext = document.createElement('div');
            cardtext.className = "cardtext";

            playercard.appendChild(cardtext);
            //#endregion text

            //#region 1st action buttons
            if (!isSpecialPlayer(player)) {
                let actionline1 = document.createElement('div');
                actionline1.className = 'actionline';

                playercard.appendChild(actionline1);
            }
            //#endregion 1st action buttons

            //#region 2nd action buttons
            let actionline2 = document.createElement('div');
            actionline2.className = 'actionline';

            let removeButton = document.createElement('button');
            removeButton.className = 'actionbutton';
            removeButton.type = 'button';
            removeButton.innerText = 'Remove Player';
            removeButton.value = idx;
            removeButton.onclick = () => removePlayer(removeButton.value);
            actionline2.appendChild(removeButton);

            playercard.appendChild(actionline2);
            //#endregion 2nd action buttons

            playercard.draggable = true;
            playercard.ondragstart = (ev) => { ev.dataTransfer.setData("text/plain", player) }
            playerNodes.push(playercard)

            // let seedTarget = document.createElement('div');
            // seedTarget.className = "seedTarget";
            // seedTarget.innerText = idx + 1;
            // seedTarget.ondragover = (ev) => { ev.preventDefault(); ev.dataTransfer.dropEffect = "link"; };
            // seedTarget.ondrop = (ev) => { ev.preventDefault(); setSeed(idx + 1, ev.dataTransfer.getData("text/plain")); }
            // seedNodes.push(seedTarget);
        });
        let playerNode = document.getElementById('players');
        playerNode.innerHTML = '';
        playerNodes.forEach(node => playerNode.appendChild(node));

        for(let i = 0; i < newState.players.length / 2; i++){
            let matchupTarget = document.createElement('div');
            
            let player1 = document.createElement('div');
            player1.className = "seedTarget";
            player1.innerText = newState.matchups[i]?.players[0] || "<1>";
            player1.ondragover = (ev) => {ev.preventDefault(); ev.dataTransfer.dropEffect = "link";};
            player1.ondrop = (ev) => {ev.preventDefault(); setPlayer(ev.dataTransfer.getData("text/plain"), 0, i);};
            matchupTarget.appendChild(player1);
            let player2 = document.createElement('div');
            player2.className = "seedTarget";
            player2.innerText = newState.matchups[i]?.players[1] || "<2>";
            player2.ondragover = (ev) => {ev.preventDefault(); ev.dataTransfer.dropEffect = "link";};
            player2.ondrop = (ev) => {ev.preventDefault(); setPlayer(ev.dataTransfer.getData("text/plain"), 1, i);};
            matchupTarget.appendChild(player2);

            matchupTarget.appendChild(document.createElement('br'));

            let player1point = document.createElement('button');
            player1point.type = "button";
            player1point.innerText = (newState.matchups[i]?.players[0] || '1') + " +1";
            player1point.onclick = () => {x.send(JSON.stringify({type: "changeScore", content: [0, 1, i]}))}
            matchupTarget.appendChild(player1point);
            let player1minus = document.createElement('button');
            player1minus.type = "button";
            player1minus.innerText = (newState.matchups[i]?.players[0] || '1') + " -1";
            player1minus.onclick = () => {x.send(JSON.stringify({type: "changeScore", content: [0, -1, i]}))}
            matchupTarget.appendChild(player1minus);
            let player2point = document.createElement('button');
            player2point.type = "button";
            player2point.innerText = (newState.matchups[i]?.players[1] || '2') + " +1";
            player2point.onclick = () => {x.send(JSON.stringify({type: "changeScore", content: [1, 1, i]}))}
            matchupTarget.appendChild(player2point);
            let player2minus = document.createElement('button');
            player2minus.type = "button";
            player2minus.innerText = (newState.matchups[i]?.players[1] || '2') + " -1";
            player2minus.onclick = () => {x.send(JSON.stringify({type: "changeScore", content: [1, -1, i]}))}
            matchupTarget.appendChild(player2minus);

            matchupTarget.appendChild(document.createElement('br'));

            let clear = document.createElement('button');
            clear.type = "button";
            clear.innerText = "Clear Match";
            clear.onclick = () => {x.send(JSON.stringify({type: "clearMatch", content: i}))}
            matchupTarget.appendChild(clear);

            let activate = document.createElement('button');
            activate.type = "button";
            activate.innerText = "Primary Match";
            activate.onclick = () => {x.send(JSON.stringify({type: "setActiveMatch", content: i}))}
            matchupTarget.appendChild(activate);

            seedNodes.push(matchupTarget);
        }

        let seedNode = document.getElementById('seedTargets');
        seedNode.innerHTML = '';
        seedNodes.forEach(node => seedNode.appendChild(node));
    }

    //renderBracket(newState);

    state = newState;
}

function sendUpdateHeart(heart) {
    x.send(JSON.stringify({ type: "updateHeart", content: heart }))
}

function addPlayer() {
    let adder = document.getElementById('playeradder');
    if (adder.value) {
        x.send(JSON.stringify({ type: "addPlayer", content: adder.value }))
        adder.value = '';
    }
}

function removePlayer(index) {
    x.send(JSON.stringify({ type: "removePlayer", content: index }));
}

function sendStartTimer() {
    x.send(JSON.stringify({ type: "startTimer" }));
}
function sendPauseTimer() {
    x.send(JSON.stringify({ type: "pauseTimer" }));
}

function initiateDivision() {
    x.send(JSON.stringify({ type: "initiateDivision" }));
}

function sendChangeTimer() {
    let hours = document.getElementById("timerEntryHrs");
    let minutes = document.getElementById("timerEntryMns");
    let seconds = document.getElementById("timerEntryScs");
    if (!state.timer.isRunning && (hours.value || minutes.value || seconds.value)) {
        let time = `${hours.value || 0}:${minutes.value || 0}:${seconds.value || 0}`;
        x.send(JSON.stringify({ type: "changeTimer", content: time }));
        hours.value = "";
        minutes.value = "";
        seconds.value = "";
    }
}

function setTimer30Mins() {
    if (!state.timer.isRunning) {
        x.send(JSON.stringify({ type: "changeTimer", content: "0:25:0" }));
    }
}

function clearActiveMatch() {
    x.send(JSON.stringify({ type: "setActiveMatch", content: -1}))
}