
let cardState;
let currentQuestion=0;
let answerResult = false;
let qbank=new Array;
let color1 = '#1972c5';
let color2= '#019875';
toggleListenerSet = false;
function loadDB(json){
    for(i=0;i<json.questionlist.length;i++){
        qbank[i]=[];
        qbank[i][0]=json.questionlist[i].cardfront;
        qbank[i][1]=json.questionlist[i].cardback;
    }
    displayCard();
}
function displayCard(){
    cardState=false;
    $("#cardArea").empty();
    $("#cardArea").append('<div id="card1" class="card">' + qbank[currentQuestion][0] + '</div>');
    $("#cardArea").append('<div id="card2" class="card">' + qbank[currentQuestion][1] + '</div>');
    $("#card1").css("background-color",color1);
    $("#card2").css("background-color",color2);
    $("#card2").css("visibility","hidden");
    if(!toggleListenerSet) {
        $("#cardArea").on("click", toggleVisibility);
        toggleListenerSet = true;
    }
    currentQuestion++;
    $("#buttonArea").empty();
    $("#buttonArea").append('<div class="button" id="right">richtig</div>');
    $("#buttonArea").append('<div class="button" id="wrong">falsch</div>');
    $("#buttonArea").append('<div class="button" id="nextButton">Überspringen</div>');
    $("#nextButton").on("click",next);
    $("#right").on("click",rightAnswer);
    $("#wrong").on("click",wrongAnswer);
    $("#wrong").css("background-color", "#c51919");

    $("#badCard").empty();
    $("#badCard").append('<div class="button" id="bad">schlecht</div>');
    $("#badCard").append('<div class="button" id="duplicate">doppelt</div>');
    $("#badCard").append('<div class="button" id="duplicate">verbessern</div>');

    $("#badCard").append('<div class="button" id="back"">zurück</div>');
    $("#back").on("click", displayMainMenu);
}
function next() {
    if(currentQuestion<qbank.length){
        displayCard();
    }
    else{
        displayFinalMessage();
    }
}
function wrongAnswer(id) {
    buildPostRequest("/answer",{"result":false, "cardId":id});
    next();
}
function rightAnswer(id) {
    buildPostRequest("/answer",{"result":true, "cardId":id});
    next();
}
function toggleVisibility(){
    console.log("toggle" + cardState)
    if(cardState) {
        $("#card2").css("visibility","hidden");
        $("#card1").css("visibility","visible");
    } else {
        $("#card2").css("visibility","visible");
        $("#card1").css("visibility","hidden");
    }
    cardState = !cardState;
}
function displayFinalMessage(){
    $("#buttonArea").empty();
    $("#cardArea").empty();
    $("#cardArea").append('<div id="finalMessage">Alle Karten gespielt Hier zum Ergebnis: KLICK.</div>');
}