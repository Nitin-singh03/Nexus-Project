const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const contractorSchema = new mongoose.Schema({
  image: {
    type: String,
    default: "https://static-00.iconduck.com/assets.00/person-icon-256x242-au2z2ine.png",
    set: (v) => v || "https://static-00.iconduck.com/assets.00/person-icon-256x242-au2z2ine.png",
  },
  Pnumber: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/, 
    unique: true
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
  location: {
    type: {
      type: String,
      enum: ['Point'], 
      default: 'Point',
      required: true 
    },
    coordinates: {
      type: [Number], 
      required: true, 
      validate: {
        validator: function(arr) {
          return arr.length === 2 && arr.every(num => typeof num === 'number');
        },
        message: "Coordinates must be an array of two numbers [longitude, latitude]."
      }
    }
  }
});

contractorSchema.index({ location: "2dsphere" });

contractorSchema.plugin(passportLocalMongoose, { usernameField: 'Pnumber' });

const Contractor = mongoose.model('Contractor', contractorSchema);

module.exports = Contractor;
