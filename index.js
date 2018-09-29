require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

const app = express();
const router = express.Router();

const environment = process.env.NODE_ENV;
const stage = require('./config')[environment];

const routes = require('./routes/index.js');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


if (environment !== 'production') {
  app.use(logger('dev'));
}

app.use('/api/v1', routes(router));
// app.use('/api/v1', (req, res, next) => {
//   res.send('Hello');
//   next();
// });

app.listen(`${stage.port}`, () => {
  console.log(`Server now listening at localhost:${stage.port}`);
});

module.exports = app;