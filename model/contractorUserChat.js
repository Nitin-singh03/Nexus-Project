const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel'
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['user', 'Contractor']
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'receiverModel'
    },
    receiverModel: {
        type: String,
        required: true,
        enum: ['user', 'Contractor']
    },
    messages: [
        {
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                refPath: 'messages.senderModel'
            },
            senderModel: {
                type: String,
                required: true,
                enum: ['user', 'Contractor']
            },
            content: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            read: {
                type: Boolean,
                default: false 
            }
        }
    ]
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
