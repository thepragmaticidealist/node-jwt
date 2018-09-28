const mongoose = require('mongoose');
const User = require('../models/users');

const connUri = process.env.MONGO_LOCAL_CONN_URL;

module.exports = {
  add: (req, res, next) => {
    mongoose.connect(connUri, { useNewUrlParser : true, authSource: 'admin' }, (err, result) => {
      if (!err) {
        const { name, password } = req.body;
        const user = new User({ name, password}); // document = instance of a model
        // TODO: We can hash the password here as well before we insert
        console.log('USER >>>>', user)
        user.save((err, resp) => {
          let result = {};
          if (!err) {
            result.status = 200;
            result.result = resp;
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
    
  }
}