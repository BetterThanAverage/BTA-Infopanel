const express = require('express');
const ws = require('ws');
const fs = require('fs');
const Mutex = require('async-mutex').Mutex;
const mutex = new Mutex();

const info = JSON.parse(fs.readFileSync("baseinfo.json"));
const port = 8080;

const app = express();
const wsServer = new ws.Server({ noServer: true });

const messageTypes = {
    system: "system",
    updateHeart: "updateHeart",
    addPlayer: "addPlayer",
    removePlayer: "removePlayer",
    refresh: "refresh",
    startTimer: "startTimer",
    pauseTimer: "pauseTimer",
    changeTimer: "changeTimer",
    initiateDivision: "initiateDivision",
    addPlayerToMatch: "addPlayerToMatch",
    setActiveMatch: "setActiveMatch",
    changeScore: "changeScore",
    clearMatch: "clearMatch",
}

var state = {
    type: 'state',
    currentHeart: 'sapphire',
    players: [],
    timer: {
        isRunning: false,
        duration: 0,
        endTime: null
    },
    info: info,
    matchups: [],
    activeMatchup: -1
};

var clients = [];

wsServer.on('connection', socket => {
    socket.send(JSON.stringify({ type: messageTypes.system, content: 'Acknowledge Connection' }));
    socket.send(JSON.stringify(state));
    clients.push(socket);
    socket.on('message', (event) => {
        mutex.runExclusive(() => {
            console.debug("Message Recieved:", event.toString());
            let data = JSON.parse(event.toString());
            if (data.type === messageTypes.updateHeart) {
                state.currentHeart = data.content;
            }
            else if (data.type === messageTypes.addPlayer) {
                state.players.push(data.content);
                state.players.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
            }
            else if (data.type === messageTypes.removePlayer) {
                let [player] = state.players.splice(data.content, 1);
                let seedidx = state.seeds.indexOf(player);
                if (seedidx) {
                    state.seeds.splice(seedidx, 1);
                }
                else {
                    state.seeds = [];
                }
            }
            else if (data.type === messageTypes.initiateDivision) {
                if (info.divisions[state.currentHeart]) {
                    state.players = [...info.divisions[state.currentHeart]];
                }
                state.seeds = [];
                state.players.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
                state.timer.duration = 1200;
                state.timer.isRunning = false;
                state.activeMatchup = -1;
                state.matchups = [];
            }
            else if (data.type === messageTypes.startTimer) {
                if (!state.timer.isRunning) {
                    state.timer.endTime = new Date(new Date().getTime() + state.timer.duration * 1000)
                    state.timer.isRunning = true
                }
                else {
                    state.timer.duration = (new Date(state.timer.endTime).getTime() - new Date().getTime()) / 1000
                }
            }
            else if (data.type === messageTypes.pauseTimer) {
                if (state.timer.isRunning) {
                    if (state.timer.endTime) {
                        state.timer.duration = (new Date(state.timer.endTime).getTime() - new Date().getTime()) / 1000
                    }
                    state.timer.isRunning = false;
                }
            }
            else if (data.type === messageTypes.changeTimer) {
                let newDuration = data.content;
                console.log("Updating time to:", newDuration);
                if (!state.timer.isRunning) {
                    try {
                        let [h, m, s] = newDuration.split(":");
                        state.timer.duration = (h * 3600) + (m * 60) + (s * 1);
                    }
                    catch (err) { console.error(err) }
                }
            }
            else if (data.type === messageTypes.addPlayerToMatch) {
                let [playerName, playerInd, brackInd] = data.content;
                if (!state.matchups[brackInd]) {
                    state.matchups[brackInd] = {
                        players: [undefined, undefined],
                        points: [0, 0]
                    }
                }
                for(let matchup of state.matchups) {
                    if(matchup?.players){
                        if(matchup.players[0] === playerName){
                            matchup.players[0] = undefined;
                        }
                        if(matchup.players[1] === playerName){
                            matchup.players[1] = undefined;
                        }
                    }
                }
                state.matchups[brackInd].players[playerInd] = playerName;
            }
            else if (data.type === messageTypes.setActiveMatch) {
                let ind = data.content;
                state.activeMatchup = ind;
            }
            else if (data.type === messageTypes.changeScore) {
                let [playerInd, changeBy, brackInd] = data.content;
                if (state.matchups[brackInd]) {
                    state.matchups[brackInd].points[playerInd] += changeBy;
                }
            }
            else if (data.type === messageTypes.clearMatch) {
                let brackInd = data.content;
                state.matchups[brackInd] = {
                    players: [undefined, undefined],
                    points: [0, 0]
                }
            }
            broadcast(state);
        })
    });
});

//Send a message to all clients
function broadcast(message) {
    let forRemoval = [];
    clients.forEach(client => {
        if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(message))
        }
        else if (client.readyState === ws.CLOSED || client.readyState === ws.CLOSING) {
            forRemoval.push(client);
            console.log('Removing a client');
        }
    });
    clients = clients.filter(item => forRemoval.indexOf(item) === -1);
}

//Debug messages
//setInterval(() => {broadcast({type: messageTypes.updateHeart, content: 'rainbow'})}, 5000);
//setInterval(() => {broadcast({type: messageTypes.updateHeart, content: 'blue'})}, 6000);
//setInterval(() => {broadcast({type: messageTypes.updateHeart, content: 'sdfs'})}, 7000);

//Serve clients
app.use('/', express.static('Clients'));

//Start Server
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
})
