const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema({
  area: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  rent: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  rent_type: {
    type: String,
    enum: ['Rs/month', 'percentage'],
    required: true
  },
  terms: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contractor",
  }
});

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;
