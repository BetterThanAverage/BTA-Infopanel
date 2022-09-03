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

function changeLevel(){
    updateLevel(document.getElementById("currentLevel").value);
}

function updateLevel(level) {
    if (/any%|9|[1-8][a-c]/.test(level)){
        x.send(JSON.stringify({ type: "changeLevel", content: level }))
    }
}

function isSpecialPlayer(playerName) {
    return playerName === 'PRELIMS' || playerName === 'FINALS' || playerName === 'SUDDEN DEATH'
}

function updateState(newState) {
    if (state.players != newState.players || state.loser != newState.loser || state.level != newState.level) {
        let nodes = [];
        let loserEl;
        let idx = 0;
        newState.players.forEach(player => {
            let flagLoser = idx === newState.loser;
            let playercard = document.createElement('div');
            playercard.className = "playercard";
            if (flagLoser) {
                playercard.className += " loser"
            }

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

                //#region berries
                let berryTally = document.createElement('p')
                berryTally.id = `tally_${player}`;
                if (newState.points && newState.points[player]) {
                    berryTally.innerText = `🍓x${newState.points[player]}`;
                }
                else {
                    berryTally.innerText = "🍓x0";
                }
                playerstats.appendChild(berryTally)
                //#endregion berries

                //#region redeems
                let redeemTally = document.createElement('p')
                redeemTally.id = `tally_${player}`;
                if (newState.points && newState.redeems[player]) {
                    redeemTally.innerText = `🐦x${newState.redeems[player]}`;
                }
                else {
                    redeemTally.innerText = "🐦x0";
                }
                playerstats.appendChild(redeemTally)
                //#endregion redeems

                //#region PB
                let PB = document.createElement('p')
                PB.id = `PB_${player}`;
                try {
                    PB.innerText = `${newState.level}: ${newState.info?.players[player][newState.level] || 'N/A'}`;
                } catch {
                    PB.innerText = 'err';
                }
                playerstats.appendChild(PB);
                //#endregion PB

                playerheader.appendChild(playerstats);
            }
            //#endregion stats

            playercard.appendChild(playerheader);
            //#endregion header

            //#region text
            let cardtext = document.createElement('div');
            cardtext.className = "cardtext";
            
            //#region funfact
            if(newState.info?.players[player]?.fun){
                let fun = document.createElement('p')
                fun.id = `fun_${player}`
                fun.innerText = newState.info.players[player].fun
                cardtext.appendChild(fun);
            }
            //#endregion funfact

            playercard.appendChild(cardtext);
            //#endregion text

            //#region 1st action buttons
            if (!isSpecialPlayer(player)) {
                let actionline1 = document.createElement('div');
                actionline1.className = 'actionline';

                let minusButton = document.createElement('button');
                minusButton.className = "actionbutton";
                minusButton.type = 'button';
                minusButton.innerText = '-🍓';
                minusButton.value = player;
                minusButton.onclick = () => removePoint(player);
                actionline1.appendChild(minusButton);
                let plusButton = document.createElement('button');
                plusButton.className = "actionbutton";
                plusButton.type = 'button';
                plusButton.innerText = '+🍓';
                plusButton.value = player;
                plusButton.onclick = () => addPoint(player);
                actionline1.appendChild(plusButton);
                let minusRdmButton = document.createElement('button');
                minusRdmButton.className = "actionbutton";
                minusRdmButton.type = 'button';
                minusRdmButton.innerText = '-🐦';
                minusRdmButton.value = player;
                minusRdmButton.onclick = () => removeRedeem(player);
                actionline1.appendChild(minusRdmButton);
                let plusRdmButton = document.createElement('button');
                plusRdmButton.className = "actionbutton"
                plusRdmButton.type = 'button';
                plusRdmButton.innerText = '+🐦';
                plusRdmButton.value = player;
                plusRdmButton.onclick = () => addRedeem(player);
                actionline1.appendChild(plusRdmButton);

                playercard.appendChild(actionline1);
            }
            //#endregion 1st action buttons

            //#region 2nd action buttons
            let actionline2 = document.createElement('div');
            actionline2.className = 'actionline';

            if (!flagLoser) {
                let loseButton = document.createElement('button');
                loseButton.className = 'actionbutton';
                loseButton.type = 'button';
                loseButton.innerText = 'Mark Loser';
                loseButton.value = idx;
                loseButton.onclick = () => markLoss(loseButton.value);
                actionline2.appendChild(loseButton);
            }
            else {
                let winButton = document.createElement('button');
                winButton.className = 'actionbutton';
                winButton.type = 'button';
                winButton.innerText = 'Unmark'
                winButton.value = idx;
                winButton.onclick = () => markLoss(-1);
                actionline2.appendChild(winButton);
            }
            let removeButton = document.createElement('button');
            removeButton.className = 'actionbutton';
            removeButton.type = 'button';
            removeButton.innerText = 'Remove Player';
            removeButton.value = idx;
            removeButton.onclick = () => removePlayer(removeButton.value);
            actionline2.appendChild(removeButton);

            playercard.appendChild(actionline2);
            //#endregion 2nd action buttons
            if (flagLoser) {
                loserEl = playercard
            }
            else {
                nodes.push(playercard)
            }
            idx++;
        });
        let playerNode = document.getElementById('players');
        playerNode.innerHTML = '';
        nodes.forEach(node => playerNode.appendChild(node));
        let loser = document.getElementById('loser')
        loser.innerHTML = '';
        if (loserEl) {
            loser.appendChild(loserEl);
        }

        let cps = document.getElementById("checkpoints");
        cps.innerHTML = "";
        if(/^any%|[1-8][a-c]|9$/.test(newState.level)){
            document.getElementById("currentLevel").value = newState.level;
            let levelinfo = newState.info?.levels[newState.level];
            if(levelinfo?.fun){
                let fun = document.createElement('p');
                fun.className = "facts"
                fun.innerText = levelinfo.fun;
                cps.appendChild(fun);
            }
            if(levelinfo?.cps){
                let checks = document.createElement('div');
                checks.className = "checkpointlist"
                for(cp of levelinfo.cps){
                    let cpp = document.createElement('p');
                    cpp.innerText = cp;
                    checks.appendChild(cpp);
                }
                cps.appendChild(checks);
            }
        }
    }
    //if (state.objective != newState.objective && newState.objective) {
    //    let div = document.getElementById('currentObjective');
    //    div.innerHTML = "";
    //    let h = document.createElement('h3');
    //    h.innerText = newState.objective.title;
    //    div.appendChild(h)
    //    let chapter = document.createElement('p')
    //    chapter.innerText = newState.objective.chosenChapter + newState.objective.sides[newState.objective.chosenChapter].join('');
    //    div.appendChild(chapter);
    //}
    //else if (!newState.objective) {
    //    let div = document.getElementById('currentObjective');
    //    div.innerHTML = "";
    //}
    Object.entries(newState.levels).forEach(([levelname, sides]) => {
        Object.entries(sides).forEach(([sidename, value]) => {
            if ((!state.levels) || (!state.levels[levelname]) || (!state.levels[levelname][sidename]) || value !== state.levels[levelname][sidename]) {
                let el = document.getElementById(levelname + sidename);
                if (el) {
                    if (value) {
                        el.style.backgroundColor = "lightgreen";
                    }
                    else {
                        el.style.backgroundColor = "coral";
                    }
                }
            }
        })
    })
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

function markLoss(index) {
    x.send(JSON.stringify({ type: "losePlayer", content: index }));
    if (index === -1) {
        let loser = document.getElementById('loser')
        loser.innerHTML = '';
    }
}

function triggerPrelims() {
    x.send(JSON.stringify({ type: "triggerPrelims" }));
}
function triggerFinals() {
    x.send(JSON.stringify({ type: "triggerFinals" }));
    updateLevel("9");
}

function triggerObjective() {
    let chSel = document.getElementById('chapter');
    if (chSel.value) {
        x.send(JSON.stringify({ type: "triggerObjective", content: chSel.value }))
    }
}
function clearObjective() {
    x.send(JSON.stringify({ type: "clearObjective" }));
}

function addPoint(player) {
    x.send(JSON.stringify({ type: "addPoint", content: player }))
}
function removePoint(player) {
    x.send(JSON.stringify({ type: "removePoint", content: player }))
}
function addRedeem(player) {
    x.send(JSON.stringify({ type: "addRedeem", content: player }))
}
function removeRedeem(player) {
    x.send(JSON.stringify({ type: "removeRedeem", content: player }))
}

function triggerLevelToggle(id) {
    x.send(JSON.stringify({ type: "toggleLevel", content: id }))
    updateLevel(id);
}

function sendStartTimer() {
    x.send(JSON.stringify({ type: "startTimer" }));
}
function sendPauseTimer() {
    x.send(JSON.stringify({ type: "pauseTimer" }));
}

function sendChangeTimer(){
    let hours = document.getElementById("timerEntryHrs");
    let minutes = document.getElementById("timerEntryMns");
    let seconds = document.getElementById("timerEntryScs");
    if(!state.timer.isRunning && (hours.value || minutes.value || seconds.value)){
        let time = `${hours.value || 0}:${minutes.value || 0}:${seconds.value || 0}`;
        x.send(JSON.stringify({type: "changeTimer", content: time}));
        hours.value = "";
        minutes.value = "";
        seconds.value = "";
    }
}