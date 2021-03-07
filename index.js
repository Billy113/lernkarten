
const BACKEND_URL = "http://localhost:8001/v1"
//const BACKEND_URL = "https://www.featurecat.de/api/v1";
let user;
let cards;
let catsInBackend;
function init() {
  document.indexDBHandler = new IndexedDbHandler();
  document.indexDBHandler.loggedIn().then(result => {
  categoriesAvailable().then(() => {
    if(result) {
          user = result;
          displayMainMenu();
    } else {
          displayLogin();
    }
  })
  });
}
function getCards() {
  return new Promise(resolve => {
    document.indexDBHandler.cats().then(usercats => {
        let catArr=[];
        for(let cat of usercats) {
          if(cat.selected) {
            catArr.push(cat.name);
          }
        }
        buildPostRequest("/cards", {"selected" : catArr}).then(userCards => {
          userCards.json().then(cardsJson => {
            cards = cardsJson;
            resolve();
          });
        }).catch(err => {
          console.log(err);
          resolve();
        })
      })
    })
}
function displayCards() {
  getCards().then(() => {
    loadDB(cards, trimCards());
    fetchAndAppendToBody("cards.html").then(() => {

    })
  })
  }
function trimCards() {
  return document.getElementById("trim").checked;
}
function displayLogin() {
  fetchAndAppendToBody("./login.html").then(() => {
    registerLoginListener()
  })
}
function displayMainMenu() {
  fetchAndAppendToBody("./main.html").then(() => {
    document.getElementById("activityTitle").innerHTML = "Lernkarten FiSi - Angemeldet als " + user;
    registerMainMenueListener()
  })
}
function registerLoginListener() {
  document.getElementById("login").addEventListener("click", handleLogin);
  document.getElementById("create").addEventListener("click", createAccount);
}
function createAccount(event) {
  buildPostRequest("/user/create", {"name" : document.getElementById("name").value}).then(result => {
    if(result.status == 200) {
      document.getElementById("activityTitle").innerHTML = `Neuen Nutzer ${document.getElementById("name").value} angelegt. Jetzt einloggen?`;
    } else {
      document.getElementById("activityTitle").innerHTML = "Nickname bereits vergeben";
    }
  })
}
function registerMainMenueListener() {
  document.getElementById("newCard").addEventListener("click", createCard);
  document.getElementById("stats").addEventListener("click", displayStats);
  document.getElementById("cats").addEventListener("click", displayCats);
  document.getElementById("logout").addEventListener("click", logout);
}
function registerCatListener() {
  document.getElementById("back").addEventListener("click", displayMainMenu);
  document.getElementById("start").addEventListener("click", displayCards);
}
function logout() {
  document.indexDBHandler.logout();
  displayLogin();
}
function buildCatButtons() {
  return new Promise (resolve => {
    document.indexDBHandler.cats().then(userCats => {
        for(let cat of cats) {
            $("#catArea").append(`<div class="button" id="${cat.name}">${cat.name}</div>`)
            $("#"+cat.name).css("background-color", "red")
            document.getElementById(cat.name).addEventListener("click", toggleUserCat);
        }
        for(let userCat of userCats) {
          if(userCat.selected) {
            $("#"+userCat.name).css("background-color", "#019875")
          }
        }
        resolve();
    })
  })
}
function toggleUserCat(event) {
   document.indexDBHandler.toggleCat(event.target.id).then(selected => {
      if(selected) {
        $("#"+event.target.id).css("background-color", "#019875")
      } else {
        $("#"+event.target.id).css("background-color", "red")
      }
   });

}
function displayCats() {
  fetchAndAppendToBody("cats.html").then(() => {
    buildCatButtons();
    registerCatListener();
  })
}
function createCard() {
  fetchAndAppendToBody("createCard.html").then(() => {
    for(let cat of cats) {
      let html = `
                   <input type="checkbox" id="${cat.name}">
                   <label for="vehicle1"> ${cat.name}</label>
                    `
      $("#catArea").append(html)
    }
    $("#cardArea").append(`<div> <textarea class="newQuestion" id="question" placeholder="Frage"></textarea> </div>`)
    $("#cardArea").append(`<div> <textarea class="newAnswer" input" id="answer" placeholder="Antwort"></textarea/></div>`)
    registerCreateCardListener();
  })

}
function registerCreateCardListener() {
  document.getElementById("store").addEventListener("click", storeCard);
  document.getElementById("discard").addEventListener("click", displayMainMenu)
}
function storeCard() {
  let card = {};
  let categorys = [];
  card.question = document.getElementById("question").value;
  card.answer= document.getElementById("answer").value;
  for(let cat of cats) {
    if(document.getElementById(cat.name).checked) {
      categorys.push(cat.name);
    }
  }
  card.categorys = categorys;
  buildPostRequest("/cards/store", card);
}
function displayStats() {
  fetchAndAppendToBody("stats.html").then(() => {
    registerStatListener();
    readStats();
  })
}
function readStats() {
  let html = "";
  let cardCount = 0;
  let statsArr = [];
  buildPostRequest("/cards/answers", {}).then(stats => {
    stats.json().then(answerJson => {
      buildPostRequest("/cards", {"selected" : []}).then(userCards => {
        userCards.json().then(userCardJson => {
          cardCount = userCardJson.length;

          let statPromises = [];
          for(let cat of cats) {
            statPromises.push(buildCatStat(cat, answerJson).then(count => {
                html += `<label for="${cat.name}">${cat.name}</label>`
                html += `<output name="${cat.name}" > ${count} Fragen richtig beantwortet</output> <br>`
                statsArr.push ( {"cat": cat, "count": count});
            }));
          }
          Promise.all(statPromises).then(() => {
            let sum = 0;
            console.log(statsArr.length)
            for(let stat of statsArr) {
              console.log("count")
              console.log(stat.count)
              sum+= stat.count;
            }
            let percantage = (cardCount/sum)*100;
            $("#statArea").append(html)
          })
        })
      });
    })
  });
}
function buildCatStat(cat, answerJson) {
  return new Promise (resolve => {
  let count = 0;
  let answerPromises = [];
  for(let answer of answerJson) {
   answerPromises.push(buildPostRequest("/cards/cardCats", {"cardId": answer.questionID}).then(cardCats => {
    cardCats.json().then(cardCatsJson => {
       if(answer.result == 1 && cardHasCat(cat, cardCatsJson)) {
          count++;
        }
        })
      }))
    }
    Promise.all(answerPromises).then(() => {
      resolve(count);
    })
  })
}
function cardHasCat(cat, cardCatIDs) {
  for(let cardCat of cardCatIDs) {
    if(cat.name == cardCat.name) {
      return true;
    }
  }
    return false;
}
function registerStatListener() {
  document.getElementById("statBack").addEventListener("click", displayMainMenu);
}
function handleLogin() {
  buildPostRequest("/user/login", {"name" : document.getElementById("name").value}).then(result => {
    if(result.status == 200) {
      document.indexDBHandler.logIn(document.getElementById("name").value);
      user = document.getElementById("name").value
      displayMainMenu();
    } else {
      document.getElementById("activityTitle").innerHTML = "Nickname noch nicht vergeben";
    }
  })
}
function fetchAndAppendToBody(htmlURL) {
  return new Promise(resolve => {
    fetch(htmlURL).then(result => {
      result.text().then(html => {
        let body = document.getElementById("body");
        body.innerHTML = html;
        resolve();
      })
    })
  })
}
function buildPostRequest(apiRoute, data) {
  if(!data.name) {
    data.name = user;
  }
  return fetch(BACKEND_URL + apiRoute, {
      method: 'POST',
       headers: {
              'content-Type': 'application/json',
       },
       redirect: 'follow',
       referrerPolicy: 'no-referrer',
      body: JSON.stringify(data)
  });
}
window.onload = () => {
  init();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./sw.js');
  }
}