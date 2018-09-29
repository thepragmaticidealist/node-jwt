const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

const connUri = process.env.MONGO_LOCAL_CONN_URL;

module.exports = {
  add: (req, res, next) => {
    mongoose.connect(connUri, { useNewUrlParser : true, authSource: 'admin' }, (err, resp) => {
      if (!err) {
        const { name, password } = req.body;
        const user = new User({ name, password}); // document = instance of a model
        // TODO: We can hash the password here as well before we insert
        user.save((err, user) => {
          let result = {};
          if (!err) {
            result.status = 201;
            result.result = user;
          } else {
            result.status = 500;
            result.error = err;
          }
          res.send(result);
        });
      } else {
        console.log(`Error connecting to mongo db ${err}`);
        return;
      }
    });
  },

  login: (req, res, next) => {
    const { name, password } = req.body;

    mongoose.connect(connUri, { useNewUrlParser: true }, (err, resp) => {
      let result = {};
      if(!err) {
        User.findOne({name}, (err, user) => {
          if (!err && user) {
            // We could compare passwords in our model instead of below as well
            bcrypt.compare(password, user.password).then(match => {
              if (match) {
                // Create a token
                const payload = { user: user.name };
                const options = { expiresIn: '2d', issuer: 'https://scotch.io' };
                const secret = process.env.JWT_SECRET;
                const token = jwt.sign(payload, secret, {options});

                console.log('TOKEN', token);
                result.token = token;
                result.status = 200;
                result.result = user;
              } else {
                result.status = 401;
                result.error = `Authentication error`;
              }
              res.send(result);
            }).catch(err => {
              result.status = 500;
              result.error = err;
              res.send(result);
            })
          } else {
            result.status = 404;
            result.error = err;
            res.send(result);
          }
        });
      } else {
        console.log(`Error connecting to mongo db ${err}`);
        result.status = 500;
        result.error = err;
        res.send(result);
      }
    });
  }
}