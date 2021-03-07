let cardState;
let currentQuestion=0;
let answerResult = false;
let qbank=new Array;
let color1 = '#1972c5';
let color2= '#019875';
let toggleListenerSet = false;
let cardList;
let cats;
let answers;
let selectHTML = `
                <div id="cartCads"></div>`;

function loadDB(json, trim){
    currentQuestion =0;
    cardList = json.questionlist;
    categoriesAvailable().then(() => {
        userAnswers().then(userAnswers => {
            userAnswers.json().then(userAnswerJson => {
                console.log(userAnswerJson);
                answers = userAnswerJson;
                buildCardList(trim);
                displayCard();
            })
        })
    })
}
function buildCardList(trim) {
    if(trim) return;
    for(let i = 0 ; i < cardList.length; i++) {
        for(let answer of answers) {
            if(cardList[i].id == answer.questionID && answer.result == 1) {
                cardList.splice(i,1);
            }
        }
    }
}
function userAnswers() {
    return new Promise(resolve => {
        buildPostRequest("/cards/answers", {}).then(userAnswers => {
            resolve(userAnswers);
        })
    })
}
function categoriesAvailable() {
    return new Promise(resolve => {
        buildPostRequest("/cards/catsAvailable", {}).then(catsAvailable => {
            catsAvailable.json().then(catsJson => {
                 cats = catsJson;
                 document.indexDBHandler.updateCats(cats);
                 resolve();
            })
        });
    })
}

function buildCategory() {
    return new Promise(resolve => {
        $("#cardCatArea").css("display","-webkit-inline-box");
        $("#cardCatArea").append(`<div class="button" id="closeCat">fertig</input>`)
        $("#closeCat").on("click", () => {
             $("#cardCatArea").css("visibility", "hidden");
             $("#topButtonArea").css("visibility", "visible");
             $("#cardCatArea").empty();

      })

        buildPostRequest("/cards/cardCats", {"cardId" : cardList[currentQuestion].id}).then(cardCats => {
            cardCats.json().then(cardCats => {
                for(let cat of cats) {
                    cat.active = false;
                    $("#cardCatArea").append(`<div class="button" id="${cat.name}">${cat.name}</input>`)
                    $("#"+cat.name).css("background-color", "red")
                    document.getElementById(cat.name).addEventListener("click", catChange);
                }
                for(let cardCat of cardCats) {
                    $("#"+cardCat.name).css("background-color", "#019875")
                    activateCat(cardCat.name);
                }
                resolve();
            })
        })
    })
}
function activateCat(catname) {
    for(let cat of cats) {
        if(cat.name == catname) {
            cat.active = true;
        }
    }
}
function catChange(event) {
    for(let cat of cats) {
        if(cat.name == event.target.id) {
            cat.active = !cat.active;
            if(cat.active) {
                $("#"+cat.name).css("background-color", "#019875")
                buildPostRequest("/cards/setCategory", {"category": cat.name , "cardId": cardList[currentQuestion-1].id});
            } else {
                $("#"+cat.name).css("background-color", "red")
                buildPostRequest("/cards/removeCategory", {"category": cat.name , "cardId": cardList[currentQuestion-1].id});
            }
        }
    }
}
function displayCard(){
    cardState=false;
    let karte = currentQuestion+1;
    document.getElementById("activityTitle").innerHTML = "Karte: " + karte+ " von: " + cardList.length;
    $("#cardArea").empty();
    document.getElementById("cardArea").removeEventListener("click", toggleVisibility);
    document.getElementById("cardArea").addEventListener("click", toggleVisibility);
    $("#cardArea").append('<div id="card1" class="card">' + cardList[currentQuestion].cardfront + '</div>');
    $("#cardArea").append('<div id="card2" class="card">' + cardList[currentQuestion].cardback + '</div>');
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
    $("#topButtonArea").append('<div class="button" id="Kategorien"">Kategorien</div>');
    $("#Kategorien").on("click", changeCats);
    $("#back").on("click", displayMainMenu);

    currentQuestion++;
}
function changeCats() {
    $("#topButtonArea").css("visibility", "hidden");
    buildCategory();
}
function next() {
    if(currentQuestion<cardList.length){
        displayCard();
    }
    else{
        displayFinalMessage();
    }
}
function deleteCard() {
    index = currentQuestion-1;
    buildPostRequest("/cards/delete", {"cardId": cardList[index].id})
    cardList.splice(index,1);
    next();
}
function wrongAnswer() {
    buildPostRequest("/user/answer",{"result":false, "cardId":cardList[currentQuestion-1].id});
    next();
}
function rightAnswer() {
    buildPostRequest("/user/answer",{"result":true, "cardId":cardList[currentQuestion-1].id});
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
    $("#newCardArea").append(`<div> <textarea class="inputQuestion input" id="newFront">${cardList[currentQuestion].cardfront}</textarea> </div>`)
    $("#newCardArea").append(`<div> <textarea class="inputAnswer input" id="newBack">${cardList[currentQuestion].cardback }</textarea/></div>`)
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
    card.id = cardList[currentQuestion].id;
    $("#newCardArea").empty();
    buildPostRequest("/cards/update", card);
    updateLokalData(card);
    next();
}
function updateLokalData(card) {
    cardList[currentQuestion].cardfront = card.question;
    cardList[currentQuestion].cardback = card.answer;
}
function displayFinalMessage(){
    $("#buttonArea").empty();
    $("#cardArea").empty();
    $("#cardArea").append('<div id="finalMessage">Alle Karten gespielt Hier zum Ergebnis: KLICK.</div>');
}
