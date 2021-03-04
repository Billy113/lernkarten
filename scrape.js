const rp = require('request-promise');
let url = 'https://www.karteikarte.com/lesson/81276/fachinformatiker-systemintegration/';
const $ = require('cheerio');
let fs = require('fs');
//fetch
let links = [];
let promises = [];
for(let i = 1; i<7; i++ ) {
    promises.push(readLinks(url + `${i}`));
}
Promise.all(promises).then(() => {
    console.log(links)
    for(let linkList of links) {
        for(let link of linkList) {
            fs.appendFile("links.txt", link + "\n", err => {
                console.log(err);
            })
        }
    }
});
function parseText(cards) {
    cards.answer = cards.answer.replace('"', "'")
    cards.question = cards.question.replace('"', "'")
    return cards;
}
function readLinks(url) {
    return new Promise(resolve => {
            rp(url)
              .then(html => {
                const cardUrls = [];
                    for (let i = 0; i < 60; i++) {
                        if( $('#wrapper > div.content > div > ul > li > a', html)[i]) {
                            cardUrls.push($('#wrapper > div.content > div > ul > li > a', html)[i].attribs.href);
                        }
                    }
                    links.push(cardUrls);
                    resolve();
              })
              .catch(function(err){
                  console.log("eror")
                  console.log(err)
        });
    });
}
