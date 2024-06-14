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
    } else if (message.type === 'selectLevel') {
        selectLevel(message.content)
    } else if (message.type === 'system') {
        console.log("Recieved System Event: ", message.content)
    }
});

function getImage(levelname, sidename) {
    switch (sidename) {
        case 'b':
            return '<img src="/infopane/res/ticket/heartgem1.png"/>';
        case 'c':
            return '<img src="/infopane/res/ticket/heartgem2.png"/>';
        case 'r':
            switch (levelname){
                case '1':
                    return '<img class="ticketicon" src="/infopane/res/ticket/wingedgoldberry.png"/>';
                case '2':
                    return '<img class="ticketicon" src="/infopane/res/strawberry.png"/>';
                case '3':
                case '6':
                    return '<img class="ticketicon" src="/infopane/res/ticket/grabless.png"/>';
                case '4':
                    return '<img class="ticketicon" src="/infopane/res/ticket/heartcassette.png"/>';
                case '5':
                    return '<img class="ticketicon" src="/infopane/res/ticket/key.png"/>';
                case '7':
                    return '<img class="ticketicon" src="/infopane/res/ticket/heartgem0.png"/>';
                case '8':
                    return '<img class="ticketicon" src="/infopane/res/ticket/fullclear.png"/>';
                default:
                    return '<img class="ticketicon" src="/infopane/res/skullBlue.png"/>';
            }
        default:
            return '<img src="/infopane/res/ticket/clear.png"/>';
    }
}

var currentLevels = [];
var currentIndex;
var totalMoves;
var isRunningRandom = false;

function moveLevelSelector(){
    prevIndex = currentIndex - 1;
    if(prevIndex < 0){
        prevIndex = currentLevels.length - 1;
    }
    currentLevels[prevIndex].className = "indicator";
    if(totalMoves === 0){
        currentIndex = prevIndex
        currentLevels[currentIndex].className = "indicator circled selected";
        x.send(JSON.stringify({type: "randomLevelSelected", level: currentLevels[currentIndex].id}));
        totalMoves -= 1;
        setTimeout(moveLevelSelector, 20000);
    }
    else if(totalMoves > 0){
        currentLevels[currentIndex].className = "indicator circled";
        currentIndex += 1;
        if(currentIndex >= currentLevels.length){
            currentIndex = 0;
        }
        totalMoves -= 1;
        setTimeout(moveLevelSelector, totalMoves > 15 ? 25 : totalMoves > 10 ? 100 : totalMoves > 5 ? 200 : 500);
    }
    else {
        currentLevels[currentIndex].className = "indicator";
        isRunningRandom = false;
    }
}

function selectLevel(number) {
    if(isRunningRandom)
        return;
    isRunningRandom = true;
    currentLevels = [];
    Object.entries(state.levels).forEach(([levelname, sides]) => {
        Object.entries(sides).forEach(([sidename, value]) => {
            let el = document.getElementById(levelname + sidename);
            if (el) {
                el.className = "indicator";
                if(value){
                    currentLevels.push(el);
                }
            }
        });
    });
    if(currentLevels.length === 0)
        return;
    currentIndex = 0;
    totalMoves = number;
    moveLevelSelector();
}

function updateState(newState) {
    Object.entries(newState.levels).forEach(([levelname, sides]) => {
        Object.entries(sides).forEach(([sidename, value]) => {
            if ((!state.levels) || (!state.levels[levelname]) || (!state.levels[levelname][sidename]) || value !== state.levels[levelname][sidename]) {
                let el = document.getElementById(levelname + sidename);
                if (el) {
                    el.innerHTML = "";
                    if (value) {
                        el.innerText = "•";
                    } else {
                        el.innerHTML = getImage(levelname, sidename);
                    }
                }
            }
        })
    })
    state = newState;
    document.getElementById('cardCover').className = state.levelTickerOpen ? 'card' : 'card-closed'
}