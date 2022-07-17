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

const sideImages = {
    'a': '<img src="/infopane/res/ticket/clear.png"/>',
    'b': '<img src="/infopane/res/ticket/heartgem1.png"/>',
    'c': '<img src="/infopane/res/ticket/heartgem2.png"/>',
}

function updateState(newState) {
    Object.entries(newState.levels).forEach(([levelname, sides]) => {
        Object.entries(sides).forEach(([sidename, value]) => {
            if ((!state.levels) || (!state.levels[levelname]) || (!state.levels[levelname][sidename]) || value !== state.levels[levelname][sidename]) {
                let el = document.getElementById(levelname + sidename);
                el.innerHTML = ""
                if (el) {
                    if (value) {
                        el.innerText = "•";
                    }
                    else {
                        el.innerHTML = sideImages[sidename];
                    }
                }
            }
        })
    })
    state = newState;
}