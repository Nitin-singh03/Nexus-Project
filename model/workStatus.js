const mongoose = require('mongoose');

const workStatusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true, // Each user can have only one active work status
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  }
});

const WorkStatus =  mongoose.model('workStatus', workStatusSchema);

module.exports = WorkStatus;