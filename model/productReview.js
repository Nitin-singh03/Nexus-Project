const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const reviewProduct = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
    },
    comment: String,
}, { timestamps: true });

const ReviewProduct = mongoose.model('ReviewProduct', reviewProduct);
module.exports = ReviewProduct;