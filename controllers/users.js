const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const connUri = process.env.MONGO_LOCAL_CONN_URL;
const User = require('../models/users');

module.exports = {
  add: (req, res) => {
    mongoose.connect(connUri, { useNewUrlParser : true, useUnifiedTopology: true }, (err) => {
      let result = {};
      let status = 201;
      if (!err) {
        const { name, password } = req.body;
        const user = new User({ name, password}); // document = instance of a model
        // TODO: We can hash the password here as well before we insert
        user.save((err, user) => {
          if (!err) {
            result.status = status;
            result.result = user;
          } else {
            status = 500;
            result.status = status;
            result.error = err;
          }
          res.status(status).send(result);
          // Close the connection after saving
          mongoose.connection.close();
        });
      } else {
        status = 500;
        result.status = status;
        result.error = err;
        res.status(status).send(result);

        mongoose.connection.close();
      }
    });
  },

  login: (req, res) => {
    const { name, password } = req.body;

    mongoose.connect(connUri, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
      let result = {};
      let status = 200;
      if(!err) {

        User.findOne({name}, (err, user) => {
          if (!err && user) {
            // We could compare passwords in our model instead of below as well
            bcrypt.compare(password, user.password).then(match => {
              if (match) {
                status = 200;
                // Create a token
                const payload = { user: user.name };
                const options = { expiresIn: '2d', issuer: 'https://scotch.io' };
                const secret = process.env.JWT_SECRET;
                const token = jwt.sign(payload, secret, options);

                result.token = token;
                result.status = status;
                result.result = user;
              } else {
                status = 401;
                result.status = status;
                result.error = `Authentication error`;
              }
              res.status(status).send(result);
            }).catch(err => {
              status = 500;
              result.status = status;
              result.error = err;
              res.status(status).send(result);

              mongoose.connection.close();
            });
          } else {
            status = 404;
            result.status = status;
            result.error = err;
            res.status(status).send(result);
          }
        }).then(() => 
          mongoose.connection.close());
      } else {
        status = 500;
        result.status = status;
        result.error = err;
        res.status(status).send(result);

        mongoose.connection.close();
      }
    });
  },

  getAll: (req, res) => {
    mongoose.connect(connUri, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
      let result = {};
      let status = 200;
      if (!err) {
        const payload = req.decoded;
        if (payload && payload.user === 'admin') {
          User.find({}, (err, users) => {
            if (!err) {
              result.status = status;
              result.error = err;
              result.result = users;
            } else {
              status = 500;
              result.status = status;
              result.error = err;
            }
            res.status(status).send(result);
          }).then(() => mongoose.connection.close());
        } else {
          status = 401;
          result.status = status;
          result.error = `Authentication error`;
          res.status(status).send(result);

          mongoose.connection.close();
        }
      } else {
        status = 500;
        result.status = status;
        result.error = err;
        res.status(status).send(result);

        mongoose.connection.close();
      }
    });
  }
};