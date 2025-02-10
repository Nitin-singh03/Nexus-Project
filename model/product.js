const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    Largedescription: String,
    Smalldescription: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: "https://plus.unsplash.com/premium_photo-1722899516572-409bf979e5d6?q=80&w=1958&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    price: Number,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
    },
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
