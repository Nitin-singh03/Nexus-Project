const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    contractId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
        required: true
    },
    contractorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contractor', 
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved'],
        default: 'pending'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Application', applicationSchema);
