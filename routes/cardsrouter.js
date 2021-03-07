const express = require('express');
const cardRouter= express.Router();
const connectionPool = require('../databaseConnectionPool');
const Promise = require('bluebird');
cardRouter.post('/', (req, res) => {
    readCards(req.body.selected).then(cards => {
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

cardRouter.post('/removeCategory', (req, res) => {
    removeCategory(req.body);
    res.status(200).send();
});
cardRouter.post('/setCategory', (req, res) => {
    setCategory(req.body);
    res.status(200).send();
});
cardRouter.post('/delete', (req, res) => {
    deleteCard(req.body.cardId)
    res.status(200).send();
});
cardRouter.post('/catsAvailable', (req, res) => {
    readCats().then(cats => {
        res.status(200).send(cats);
    })
});
cardRouter.post('/cardCats', (req, res) => {
    readCardCats(req.body.cardId).then(cats => {
        res.status(200).send(cats);
    })
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
function readCardCats(cardId) {
    return new Promise(resolve => {
        let sql = `SELECT category as name FROM cardCats WHERE cardId = '${cardId}'`;
        connectionPool.query(sql, (error, rows) => {
            if(error) {
                console.log(error);
                resolve(false);
            }
            resolve(rows);
        })
    })
}
function removeCategory(body) {
    let sql = `DELETE FROM cardCats WHERE cardId = "${body.cardId}" AND category = "${body.category}"`;
    connectionPool.query(sql, (error, rows) => {
        if(error) {
            console.log(error);
        } else {

        }
    })
}
function setCategory(body) {
    let sql = `INSERT INTO cardCats VALUES("${body.cardId}","${body.category}")`;
    connectionPool.query(sql, (error, rows) => {
        if(error) {
            console.log(error);
        } else {

        }
    })
}
function deleteCard(id) {
    let sql = `DELETE FROM cards WHERE id='${id}'`;
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
function buildSelectSql(catsSelected) {
    let sql = `SELECT * FROM cardCats ` ;
    if(catsSelected.length == 0) {
        return `SELECT * FROM cards` ;
    }
    sql += ` INNER JOIN cards ON cards.id = cardCats.cardId WHERE `;
    for(let i = 0; i<catsSelected.length; i++) {
        if(i == 0) {
            sql += ` cardCats.category = '${catsSelected[i]}' `
        } else {
            sql += ` OR cardCats.category = '${catsSelected[i]}' `
        }
    }

    return sql;
}
function readCards(catsSelected) {
return new Promise(resolve => {
    let sql = buildSelectSql(catsSelected);
    console.log(sql);
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

