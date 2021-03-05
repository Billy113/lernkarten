const BACKEND_URL = "http://localhost:8001/v1"
//const BACKEND_URL = "https://www.featurecat.de/api/v1";
let user;
let cards;
function init() {
  document.indexDBHandler = new IndexedDbHandler();
  document.indexDBHandler.loggedIn().then(result => {
    if(result) {
          user = result;
          displayMainMenu();
    } else {
          displayLogin();
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
  document.getElementById("lern").addEventListener("click", displayCards);
  document.getElementById("logout").addEventListener("click", logout);
}
function logout() {
  document.indexDBHandler.logout();
  displayLogin();
}
function createCard() {

}
function displayStats() {

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