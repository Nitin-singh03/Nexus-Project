const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  Pnumber: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{10}$/,
  },
  username: { 
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
  },
  aadhar: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[0-9]{12}$/ 
  },
  district: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  valid: {
    type: Boolean,
    default: false,
  }
});
userSchema.plugin(passportLocalMongoose, { usernameField: 'Pnumber' }); 

const Seller = mongoose.model('Seller', userSchema);

module.exports = Seller;
