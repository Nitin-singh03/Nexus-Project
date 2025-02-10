const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  Pnumber: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/
  }
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'Pnumber' });

const Admin = mongoose.model('admin', userSchema);

module.exports = Admin;
