
const BACKEND_URL = "http://localhost:8001/v1"
//const BACKEND_URL = "https://www.featurecat.de/api/v1";

let serverEvents = new EventSource(BACKEND_URL + "/media/event");
let mediaHandler;
let user;
let partner;
let password;
//Jasmin 22081996
//Bilal einiem1!
function init() {
  document.indexDBHandler = new IndexedDbHandler();
  document.indexDBHandler.loggedIn().then(result => {
    if(result) {
          user = result.username;
          password = result.password;
          setPartner();
          displayMainMenu();
    } else {
          displayLogin();
    }
  })

  mediaHandler = new MediaHandler()

}
//todo fetch parnter...
function setPartner() {
  if(user == "Jasmin" ) {
    partner = "Bilal"
  }
  else if(user == "Bilal" ) {
    partner = "Jasmin"
  }
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
function displayUpload() {
  fetchAndAppendToBody("./upload.html").then(() => {
    document.getElementById("upload_container").innerHTML =
    `<div class="upload_form" id="upload_form">
      <form method="POST" class="form_container" action="${BACKEND_URL}/media/uploadImages" enctype="multipart/form-data">
          <div>
              <br>
              <input name="multiple_images" class="btn select_btn" type="file" multiple />
          </div>
          <div name="test" value="test2">
              <input name="btn_upload_multiple_images" id="send" class="btn upload_btn" type="submit"  value="${partner}">
          </div>
      </form>
  </div>
  <div class="btn scroll go_back" id="go_back">
    <h1> &#8593;</h1>
  </div>
`
    registerUploadListner()
  })
}
function displayImageFeed() {
  fetchAndAppendToBody("displayMedia.html").then(() => {
    registerMediaListener();
    mediaHandler.loadLastImage().then(uri => {
      displayURI(uri);
      setupEventSource();
    })
  })
}
function displayFeature() {
  fetchAndAppendToBody("displayFeature.html").then(() => {
    registerFeatureListener();
  })
}
function showFeedBtn() {
  displayImageFeed();
}
function sendImgBtn() {
  displayUpload();
}
function featureBtn() {
  displayFeature();
}
function registerLoginListener() {
  document.getElementById("login").addEventListener("click", handleLogin);
}
function registerFeatureListener() {
  document.getElementById("go_back").addEventListener("click", displayMainMenu);
}
function  registerUploadListner() {
  document.getElementById("go_back").addEventListener("click", displayMainMenu);
  document.getElementById("send").addEventListener("click", uglySetSender);
}
function registerMediaListener() {
  document.getElementById("scroll_left").addEventListener("click", previous_media)
  document.getElementById("scroll_right").addEventListener("click", next_media)
  document.getElementById("go_back").addEventListener("click", displayMainMenu);
}
function registerMainMenueListener() {
  document.getElementById("left_button").addEventListener("click", sendImgBtn)
  document.getElementById("right_button").addEventListener("click", featureBtn)
  document.getElementById("middle_button").addEventListener("click", showFeedBtn)
}
function handleLogin() {
  let name = document.getElementById("user_name").value;
  let password = document.getElementById("user_password").value;
  user = name;
  buildPostRequest("/media/login", {"password" : password}).then(result => {
    result.json().then(body => {
      if(body.valid) {
        document.indexDBHandler.store("geheim", {"username": name, "password": password}, 1)
        setPartner();
        displayMainMenu();
      } else {
        document.getElementById("upload_label").innerHTML = "Falsche Logindaten"
      }
  })
})
}
function uglySetSender() {
  buildPostRequest("/media/uglySetSender", {"reciver": partner})
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
function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

function debounce(func, wait) {
    var timeout;
    var waitFunc;

    return function() {
        if (isFunction(wait)) {
            waitFunc = wait;
        }
        else {
            waitFunc = function() { return wait };
        }
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, waitFunc());
    };
}

// reconnectFrequencySeconds doubles every retry
var reconnectFrequencySeconds = 1;
var evtSource;

var reconnectFunc = debounce(function() {
    setupEventSource();
    // Double every attempt to avoid overwhelming server
    reconnectFrequencySeconds *= 2;
    // Max out at ~1 minute as a compromise between user experience and server load
    if (reconnectFrequencySeconds >= 64) {
        reconnectFrequencySeconds = 64;
    }
}, function() { return reconnectFrequencySeconds * 1000 });

function eventSourceFunction(e) {
    if(e.data == user) {
      console.log("NEW MEDIA")
        evtSource.onmessage = 'undefined'
        document.getElementById("new_media").style.visibility = "visible";
        document.getElementById("new_media").addEventListener("click" , () => {
          loadNewMedia().then(() => {
            evtSource.onmessage = eventSourceFunction;
            document.getElementById("new_media").style.visibility = "hidden";
          })
        })
    }
}


function setupEventSource() {
    evtSource = new EventSource(BACKEND_URL + "/media/event");
    evtSource.onmessage = eventSourceFunction;
    evtSource.onopen = function(e) {
      // Reset reconnect frequency upon successful connection
      reconnectFrequencySeconds = 1;
    };
    evtSource.onerror = function(e) {
      evtSource.close();
      reconnectFunc();
    };
}

function loadNewMedia() {
  return new Promise( resolve => {
     mediaHandler.loadNewMedia().then(result => {
      if(result.status == 200) {
        mediaHandler.next();
        resolve(true)
      } else {
        resolve(false)
     }
    })
  })
}

function previous_media() {
  mediaHandler.previous().then(uri => {
      displayURI(uri)
  })
}

function next_media() {
  mediaHandler.next().then(uri=> {
      displayURI(uri)
      mediaHandler.markPictureAsSeen();
  })
}
function displayURI(uri) {
  document.getElementById("mediaDiv").innerHTML = `<img src= "${uri}" ></img>`
}
function buildPostRequest(apiRoute, data) {
  console.log("fetching")
  data.sender = user;
 //data.password = password;
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
  'use strict';
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./sw.js');
  }
}

