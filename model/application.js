const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    contractId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
        required: true
    },
    contractorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contractor', // Reference to the Contractor model
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Ensure 'User' matches your actual model name
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved'],
        default: 'pending' // Default status is "pending"
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Application', applicationSchema);
