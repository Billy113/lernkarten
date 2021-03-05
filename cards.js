
let colorArray=["#019875","#1E8BC3","#D91E18","#D35400","#8E44AD","#C0392B"];
let cardState;
let currentQuestion=0;
let qbank=new Array;

function loadDB(json){
    for(i=0;i<json.questionlist.length;i++){
        qbank[i]=[];
        qbank[i][0]=json.questionlist[i].cardfront;
        qbank[i][1]=json.questionlist[i].cardback;
    }
    displayCard();
}
function displayCard(){
    cardState=0;
    let color1=colorArray[Math.floor(Math.random()*colorArray.length)];
    $("#cardArea").empty();
    $("#cardArea").append('<div id="card1" class="card">' + qbank[currentQuestion][0] + '</div>');
    $("#cardArea").append('<div id="card2" class="card">' + qbank[currentQuestion][1] + '</div>');
    $("#card1").css("background-color",color1);
    $("#card2").css("background-color","#34495E");
    $("#card2").css("top","200px");
    $("#cardArea").on("click",function(){
        if(cardState!=1){
            cardState=1;
            $("#card1").animate({top: "-=200"}, 150, function() {cardState=0;togglePosition();});
            $("#card2").animate({top: "-=200"}, 150, function() {togglePosition2();});
        }
    });
    currentQuestion++;
    $("#buttonArea").empty();
    $("#buttonArea").append('<div class="button" id="nextButton">NEXT</div>');
    $("#buttonArea").append('<div class="button" id="richtig">richtig</div>');
    $("#buttonArea").append('<div class="button" id="falsch">falsch</div>');
    $("#nextButton").on("click",next);
    $("#richtig").on("click",correct);
    $("#falsch").on("click",wrong);
}
function next() {
    if(currentQuestion<qbank.length){
        displayCard();
    }
    else{
        displayFinalMessage();
    }
}
function correct() {

}
function wrong() {

}
function togglePosition(){
    if($("#card1").position().top==-200){$("#card1").css("top","200px");};
}

function togglePosition2(){
    if($("#card2").position().top==-200){$("#card2").css("top","200px");};
}
function displayFinalMessage(){
    $("#buttonArea").empty();
    $("#cardArea").empty();
    $("#cardArea").append('<div id="finalMessage">Alle Karten gespielt Hier zum Ergebnis: KLICK.</div>');
}
