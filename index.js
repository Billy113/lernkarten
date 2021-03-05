const BACKEND_URL = "http://localhost:8001/v1"
//const BACKEND_URL = "https://www.featurecat.de/api/v1";
let user = "billy";
function init() {
  document.indexDBHandler = new IndexedDbHandler();
  document.indexDBHandler.loggedIn().then(result => {
    if(result) {
          displayMainMenu();
    } else {
          displayCards();
          //displayLogin();
    }
  })
}
function getCards() {
  return new Promise(resolve => {
    buildPostRequest("/cards", {}).then(userCards => {
      userCards.json().then(cardsJson => {
        cards = cardsJson;
        resolve();
      });
    }).catch(err => {
      console.log(err);
      resolve();
    })
  })
}
function displayCards() {
  getCards().then(() => {
    fetchAndAppendToBody("cards.html").then(() => {
      loadDB(cards);
    })
    })
  }
function displayLogin() {
  fetchAndAppendToBody("./login.html").then(() => {
    registerLoginListener()
  })
}
function displayMainMenu() {
  fetchAndAppendToBody("./main_menu.html").then(() => {
    document.getElementById("header_text").innerHTML = ` &#x1f408; Frohe Weihnachten ${user} &#x1f408;`
    registerMainMenueListener()
  })
}
function registerLoginListener() {
  document.getElementById("login").addEventListener("click", handleLogin);
}
function registerMainMenueListener() {
  document.getElementById("random").addEventListener("click", playRandom);
  document.getElementById("stats").addEventListener("click", showStats);
  document.getElementById("create").addEventListener("click", createCard);
}
function handleLogin() {
  let name = document.getElementById("name").value;
  user = name;
  indexedDB.logIn(name);
  displayMainMenu();
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
  data.name = user;
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