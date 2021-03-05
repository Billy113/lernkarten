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
cardRouter.post('/create', (req, res) => {
    readCards(req.body.name).then(cards => {
        console.log(req.body.name)
        let name = req.body.name;
        res.status(200).send(cards);
    })
});
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

