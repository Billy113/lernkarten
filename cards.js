let cardState;
let currentQuestion=0;
let answerResult = false;
let qbank=new Array;
let color1 = '#1972c5';
let color2= '#019875';
let toggleListenerSet = false;
let questionList;
let cats;
let  choosenHTML = `
                <label for="Kategorie">Ausgewählte Kategorien: </label>
                    <select id="chooseCategory" name="category" >
                </select>`;

let selectHTML = `
                <label for="Kategorie">Kategorie hinzufügen: </label>
                    <select id="selectCategory" name="category" >
                </select>`;

function loadDB(json){
    questionList = json.questionlist;
    categoriesAvailable().then(() => {
        displayCard();
    })
}
function categoriesAvailable() {
    return new Promise(resolve => {
        buildPostRequest("/cards/cats", {}).then(catsAvailable => {
            catsAvailable.json().then(catsJson => {
                 cats = catsJson;
                 resolve();
            })
        });
    })
}
function buildCategory() {
    buildPostRequest("/cards/cardCats", {"cardId": questionList[currentQuestion]}).then(cardCats => {
        for(let cat of cats) {
            cardCats.json(cardCatsJson => {
                for(let cardCat of cardCatsJson) {
                    $("#category").append(`<option value="${cat.name}">${cat.name}</option>`)
                }
            })
        }
    })
}
function displayCard(){
    buildCategory();
    console.log("display")
    cardState=false;
    document.getElementById("activityTitle").innerHTML = "Karte: " + questionList[currentQuestion].id + " von: " + questionList.length;
    $("#cardArea").empty();
    document.getElementById("cardArea").removeEventListener("click", toggleVisibility);
    document.getElementById("cardArea").addEventListener("click", toggleVisibility);
    $("#cardArea").append('<div id="card1" class="card">' + questionList[currentQuestion].cardfront + '</div>');
    $("#cardArea").append('<div id="card2" class="card">' + questionList[currentQuestion].cardback + '</div>');
    $("#card1").css("background-color",color1);
    $("#card2").css("background-color",color2);
    $("#card2").css("visibility","hidden");

    $("#buttonArea").empty();
    $("#buttonArea").append('<div class="button" id="right">richtig</div>');
    $("#buttonArea").append('<div class="button" id="wrong">falsch</div>');
    $("#buttonArea").append('<div class="button" id="nextButton">Überspringen</div>');
    $("#nextButton").on("click",next);
    $("#right").on("click",rightAnswer);
    $("#wrong").on("click",wrongAnswer);
    $("#wrong").css("background-color", "#c51919");

    $("#topButtonArea").empty();
    $("#topButtonArea").append('<div class="button" id="delete">löschen</div>');
    $("#topButtonArea").append('<div class="button" id="edit">verbessern</div>');
    $("#edit").on("click", editCard);
    $("#delete").on("click", deleteCard);
    $("#topButtonArea").append('<div class="button" id="back"">zurück</div>');
    $("#topButtonArea").append(selectHTML);
    $("#category").on('change', logSelection);
    $("#back").on("click", displayMainMenu);
    currentQuestion++;
}
function logSelection(event) {
    buildPostRequest("/cards/setCategory", {"category": event.target.value, "cardId": questionList[currentQuestion-1].id});
    questionList[currentQuestion-1].category = event.target.value;
 }
function setCategory(event) {
    buildPostRequest("/cards/updatecategory",{"category":"" })
}

function next() {
    if(currentQuestion<questionList.length){
        displayCard();
    }
    else{
        displayFinalMessage();
    }
}
function deleteCard() {
    index = currentQuestion-1;
    buildPostRequest("/cards/delete", {"cardId": questionList[index].id})
    questionList.splice(index,1);
    next();
}
function wrongAnswer() {
    buildPostRequest("/user/answer",{"result":false, "cardId":questionList[currentQuestion].id});
    next();
}
function rightAnswer() {
    buildPostRequest("/user/answer",{"result":true, "cardId":questionList[currentQuestion].id});
    next();
}
function toggleVisibility(){
    if(cardState) {
        $("#card2").css("visibility","hidden");
        $("#card1").css("visibility","visible");
    } else {
        $("#card2").css("visibility","visible");
        $("#card1").css("visibility","hidden");
    }
    cardState = !cardState;
}
function editCard() {
    currentQuestion--;
    hideAll();
}
function hideAll() {
    $("#cardArea").empty();
    $("#buttonArea").empty();
    $("#topButtonArea").empty();
    $("#newCardArea").append(`<div> <textarea class="inputQuestion input" id="newFront">${questionList[currentQuestion].cardfront}</textarea> </div>`)
    $("#newCardArea").append(`<div> <textarea class="inputAnswer input" id="newBack">${questionList[currentQuestion].cardback }</textarea/></div>`)
    $("#buttonArea").append('<div class="button" id="send">abschicken</div>');
    $("#buttonArea").append('<div class="button" id="discard">verwerfen</div>');
    $("#send").on("click",sendEditedCard);
    $("#discard").on("click",goback);
}
function goback() {
    $("#newCardArea").empty();
    next();
}
function sendEditedCard() {
    let card = {};
    card.question = document.getElementById("newFront").value;
    card.answer = document.getElementById("newBack").value;
    card.category = "ga1";
    card.id = questionList[currentQuestion].id;
    $("#newCardArea").empty();
    buildPostRequest("/cards/update", card);
    updateLokalData(card);
    next();
}
function updateLokalData(card) {
    questionList[currentQuestion].cardfront = card.question;
    questionList[currentQuestion].cardback = card.answer;
}
function displayFinalMessage(){
    $("#buttonArea").empty();
    $("#cardArea").empty();
    $("#cardArea").append('<div id="finalMessage">Alle Karten gespielt Hier zum Ergebnis: KLICK.</div>');
}
