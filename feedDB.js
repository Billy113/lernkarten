const rp = require('request-promise');
let url = 'https://www.karteikarte.com';
const $ = require('cheerio');
const connectionPool = require('./databaseConnectionPool');
let fs = require('fs');
const lineByLine = require('n-readlines');
const liner = new lineByLine('./links.txt');

let line = liner.next();
readLine(line);
function readLine(line) {
    readCard(url + line.toString()).then(card => {
        storeCard(parseText(card)).then(() => {
            line = liner.next();
            if(line) {
                readLine(line);
            }
        });
})
}
let regex = /"/g;
function parseText(cards) {
    cards.answer = cards.answer.replace(regex, "'");
    cards.question = cards.question.replace(regex, "'");
    return cards;
}
function storeCard(card) {
    return new Promise (resolve => {
        let sql = `INSERT INTO cards(frage, antwort) VALUES("${card.question}", "${card.answer}")`;
      connectionPool.query(sql, (error, rows) => {
            if(error) {
                console.log(error);
            }
            resolve();
            })
    })
}
function readCard(url) {
    return new Promise(resolve => {
            rp(url)
              .then(html => {
                let answer;
                let question;
                    let answerWithSpan = $('.card_front', html).html()
                    answer = $('.card_back', html).html().slice(answerWithSpan.indexOf("n>")+2).trim();
                    question= $('.card_front', html).html().slice(answerWithSpan.indexOf("n>")+2).trim();
                    resolve({"answer": answer, "question": question});
              })
              .catch(function(err){
                  console.log("eror")
                  console.log(err)
        });
    });
}
