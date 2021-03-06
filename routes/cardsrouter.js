const express = require('express');
const cardRouter= express.Router();
const connectionPool = require('../databaseConnectionPool');
const Promise = require('bluebird');
cardRouter.post('/', (req, res) => {
    readCards(req.body.name).then(cards => {
        console.log(req.body.name)
        let name = req.body.name;
        res.status(200).send(cards);
    })
});
cardRouter.post('/update', (req, res) => {
    let card = {};
    card.question = req.body.question;
    card.answer = req.body.answer;
    card.let = req.body.category;
    card.id = req.body.id;
    updateCard(card);
    res.status(200).send();
});
cardRouter.post('/create', (req, res) => {
    readCards(req.body.name).then(cards => {
        res.status(200).send(cards);
    })
});

cardRouter.post('/cats', (req, res) => {
    readCats().then(cats => {
        res.status(200).send(cats);
    })
});
cardRouter.post('/setCategory', (req, res) => {
    setCategory(req.body);
    res.status(200).send();
});
cardRouter.post('/delete', (req, res) => {
    deleteCard(req.body.cardId)
    res.status(200).send();
});
function readCats() {
    return new Promise(resolve => {
        let sql = "SELECT name FROM category";
        connectionPool.query(sql, (error, rows) => {
            if(error) {
                console.log(error);
                resolve(false);
            } else {
                resolve(rows)
            }
        })
    })
}
function setCategory(card) {
    let sql = `UPDATE cards answer SET category = "${card.category}" WHERE id = "${card.cardId}"`;
    console.log(sql)
}
function deleteCard(id) {
    let sql = `DELETE FROM cards WHERE id='${id}'`;
    console.log(sql)
    connectionPool.query(sql, (error, rows)=> {
        if(error) {
            console.log(error);
        } else {
        }
    })
}
function updateCard(card) {
    return new Promise(resolve => {
        let sql = `UPDATE cards answer SET antwort = "${card.answer}", frage = "${card.question}", category = "${card.category}" WHERE id = "${card.id}"`;
        console.log(sql)
        connectionPool.query(sql, (error, rows) => {
            if(error) {
                console.log(error)
                resolve(false);
            } else {
               resolve(true);
            }
        });
    });
}
function readCards() {
return new Promise(resolve => {
    let sql = `SELECT * FROM cards`;
    connectionPool.query(sql, (error, rows) => {
        if(error) {
            console.log(error);
            resolve();
        }
        resolve(buildCardJson(rows));
    });
})
}
function buildCardJson(rows) {
    let cardArray = [];
    for(let row of rows) {
        cardArray.push({"id" : row.id, "cardfront" : row.frage, "cardback" : row.antwort, "category" : row.category});
    }
    return {"questionlist": cardArray};
}
module.exports = cardRouter;

