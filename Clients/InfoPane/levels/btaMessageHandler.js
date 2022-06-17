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
    Object.entries(newState.levels).forEach(([levelname, sides]) => {
        Object.entries(sides).forEach(([sidename, value]) => {
            if ((!state.levels) || (!state.levels[levelname]) || (!state.levels[levelname][sidename]) || value !== state.levels[levelname][sidename]) {
                let el = document.getElementById(levelname + sidename);
                if (el) {
                    if (value) {
                        el.style.backgroundColor = "#425e7d";
                        el.style.borderColor = null;
                        el.style.textDecoration = null;
                        el.style.color = null;
                    }
                    else {
                        el.style.backgroundColor = "grey";
                        el.style.borderColor = "lightgrey";
                        el.style.textDecoration = "line-through solid black 5px";
                        el.style.color = "black";
                    }
                }
            }
        })
    })
    state = newState;
}