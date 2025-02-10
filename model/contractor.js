const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  image:{
        type: String,
        default: "https://static-00.iconduck.com/assets.00/person-icon-256x242-au2z2ine.png",
        set: (v) => v || "https://static-00.iconduck.com/assets.00/person-icon-256x242-au2z2ine.png",
  },
  Pnumber: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/ 
  },
  email: {
    type: String,
    match: /.+\@.+\..+/ 
  },
  aadhar: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  district: {
    type: String,
    required: true
  },
  valid: { 
    type: Boolean,
    default: false,
  },
  username: { 
    type: String,
    required: true,
  },
});


userSchema.plugin(passportLocalMongoose, { usernameField: 'Pnumber' });

const Contractor = mongoose.model('Contractor', userSchema);

module.exports = Contractor;
