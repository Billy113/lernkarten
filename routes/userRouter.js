const express = require('express');
const cardRouter= express.Router();
const connectionPool = require('../databaseConnectionPool');
const Promise = require('bluebird');
const { resolve } = require('bluebird');
cardRouter.post('/login', (req, res) => {
        console.log(req.body.name)
        userExist(req.body.name).then(result => {
            if(result) {
                res.status(200).send();
            } else {
                res.status(204).send();
            }
        })
});
cardRouter.post('/create', (req, res) => {
        console.log(req.body.name);
        userExist(req.body.name).then(result => {
            if(result) {
                console.log("exist")
                res.status(204).send();
            } else {
                insertNewUser(req.body.name).then(result =>{
                    if(result) {
                        res.status(200).send();
                    } else {
                        res.status(500).send();
                    }
                });
            }
        });
});
function userExist(name) {
    console.log("use exist??")
    return new Promise(resolve => {
        let sql = `SELECT * FROM user WHERE name = '${name}'`;
        connectionPool.query(sql, (error, rows) => {
            if(error) {
                console.log(error);
                console.log("user exist error")
                resolve(false);
            } else {
                if(rows.length > 0) {
                    console.log("name" + rows[0].name);
                    resolve(rows[0].name)
                }
                resolve(false)
            }
        })
    })
}
function insertNewUser(name) {
    return new Promise(resolve => {
        let sql = `INSERT INTO user VALUES('${name}')`;
        console.log(sql)
        connectionPool.query(sql, (error, rows) => {
            if(error) {
                console.log(error);
                resolve(false);
            } else {
                resolve(true);
            }
        })

    })
}

module.exports = cardRouter;

