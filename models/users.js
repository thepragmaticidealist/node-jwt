const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const environment = process.env.NODE_ENV;
const stage = require('./config')[environment];

// schema maps to a collection
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: 'String',
    required: true,
    trim: true
  },
  password: {
    type: 'String',
    required: true,
    trim: true
  }
});

// encrypt password before save
userSchema.pre('save', (next) => {
  const user = this;
  if (user.isModified || user.isNew) {
    // hash the password then save it
    bcrypt.hash(this.password, stage.saltingRounds, (err, hash) => {
      if (err) {
        console.log('Error hashing password for user', user.name);
        next(err);
      } else {
        user.password = hash;
      }
    });
  } else {
    next();
  }
});

module.exports = mongoose.model('User', userSchema);