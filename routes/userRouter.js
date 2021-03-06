const express = require('express');
const userRouter= express.Router();
const connectionPool = require('../databaseConnectionPool');
const Promise = require('bluebird');
userRouter.post('/login', (req, res) => {
        console.log(req.body.name)
        userExist(req.body.name).then(result => {
            if(result) {
                res.status(200).send();
            } else {
                res.status(204).send();
            }
        })
});
userRouter.post('/create', (req, res) => {
        console.log(req.body.name);
        userExist(req.body.name).then(result => {
            if(result) {
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
userRouter.post('/answer', (req, res) => {
    let sql = `INSERT INTO answers VALUES (NULL, '${req.body.cardId}', '${req.body.name}',${req.body.result})`;
    connectionPool.query(sql, (error, rows) => {
        if(error) {
            console.log(error);
            res.status(500).send();
        } else {
            res.status(200).send();
        }
    })
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
module.exports = userRouter;

