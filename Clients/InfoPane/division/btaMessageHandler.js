const hearts = {
    blue: "/infopane/res/blueheart.gif",
    red: "/infopane/res/redheart.gif",
    yellow: "/infopane/res/yellowheart.gif",
    silver: "/infopane/res/silverheart.gif",
    rainbow: "/infopane/res/rainbowheart.gif",
    cracked: "/infopane/res/fakeheart.gif"
}
const divisionTitles = {
    blue: "Blue Division",
    red: "Red Division",
    yellow: "Yellow Division",
    silver: "Silver Division",
    rainbow: "Rainbow Division",
    cracked: "Cracked Division"
}
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
    if(state.currentHeart !== newState.currentHeart){
        updateHeart(newState.currentHeart);
    }
    state = newState;
}

function updateHeart(heart){
    document.getElementById("heartImage").src = hearts[heart] || hearts.silver;
    document.getElementById("divisionheader").innerText = divisionTitles[heart] || '';
}
