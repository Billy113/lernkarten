const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');

const cardRouter = require('./routes/cards');
const apiPath = "/v1";
//init express
const app = express();
//set value for PORT
const PORT = process.env.PORT || 8001;

app.use(express.static(__dirname + '/public'));
//use logger
app.use(logger('dev'));

//use CORS
app.use(cors());

//use body-parser for HTTP POST requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(`${apiPath}/cards`, cardRouter);

//init server on the defined PORTusr
app.listen(PORT, "::1", () => {
    console.log('Server is listening on port ' + PORT);
});

module.exports = app;
