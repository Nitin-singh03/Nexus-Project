const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  Pnumber: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{10}$/
  },
  email: {
    type: String,
    match: /.+\@.+\..+/
  },
  username: {
    type: String,
    required: true,
  },
  follows: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contractor'
  }]
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'Pnumber' });

const User = mongoose.model('user', userSchema);

module.exports = User;
