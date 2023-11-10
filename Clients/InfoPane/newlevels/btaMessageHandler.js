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
            if (levelname !== '6') {
                return '<img src="/infopane/res/strawberry.png" height="64px"/>';
            }
            default:
                return '<img src="/infopane/res/ticket/clear.png"/>';
    }
}

function updateState(newState) {
    Object.entries(newState.levels).forEach(([levelname, sides]) => {
        Object.entries(sides).forEach(([sidename, value]) => {
            if ((!state.levels) || (!state.levels[levelname]) || (!state.levels[levelname][sidename]) || value !== state.levels[levelname][sidename]) {
                let el = document.getElementById(levelname + sidename);
                if (el) {
                    el.innerHTML = ""
                    if (el) {
                        if (value) {
                            el.innerText = "•";
                        } else {
                            el.innerHTML = getImage(levelname, sidename);
                        }
                    }
                }
            }
        })
    })
    state = newState;
    document.getElementById('cardCover').className = state.levelTickerOpen ? 'card' : 'card-closed'
}