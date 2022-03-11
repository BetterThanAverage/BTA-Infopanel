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

function TypeWriter(){
    let text = document.getElementById('bigText');
    if(text && text.innerText.length < state.objective.title.length){
        let adjust = 1;
        if(state.objective.title[text.innerText.length] == ' ' && state.objective.title.length >= text.innerText.length+adjust)
            adjust = 2;
        text.innerText = state.objective.title.substring(0, text.innerText.length+adjust);
        setTimeout(TypeWriter, 80);
    }
    else if(text){
        document.getElementById('smallText').innerText = state.objective.chosenChapter + state.objective.sides[state.objective.chosenChapter].join('');
    }
}

function updateState(newState){
    if(state.objective != newState.objective && newState.objective){
        let div = document.getElementById('objective');
        div.innerHTML = "";
        let h = document.createElement('h3');
        h.id = "bigText";
        //h.innerText = newState.objective.title;
        div.appendChild(h)
        let chapter = document.createElement('p')
        chapter.id = "smallText";
        //chapter.innerText = newState.objective.chosenChapter + newState.objective.sides[newState.objective.chosenChapter].join('');
        div.appendChild(chapter);
        state = newState;
        TypeWriter();
    }
    else if(!newState.objective){
        let div = document.getElementById('objective');
        div.innerHTML = "";
        state = newState;
    }
}