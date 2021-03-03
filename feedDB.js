const rp = require('request-promise');
let url = 'https://www.karteikarte.com';
const $ = require('cheerio');
let fs = require('fs');
readCard(url + "/card/2139207/nenne-drei-server-arten-und-deren-funktionen-im-netzwerk");

function readCard(url) {
    return new Promise(resolve => {
            rp(url)
              .then(html => {
                let answer;
                let question;
                    //cardUrls.push($('.card_front > info', html)[i].attribs.href);
                    let answerWithSpan = $('.card_front', html).html()
//                    console.log(answerWithSpan);
                    answer = $('.card_front', html).html().slice(answerWithSpan.indexOf("n>")+2).trim();
                   console.log(answer) ;
                    resolve();
              })
              .catch(function(err){
                  console.log("eror")
                  console.log(err)
        });
    });
}
