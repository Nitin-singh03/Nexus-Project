
const Product = require('../model/product');
const ReviewProduct = require('../model/productReview.js');
const User = require("../model/user.js");

exports.createProduct = async (req, res) => {
    try {
        const { title, Largedescription, Smalldescription, category, price } = req.body;

        const ownerId = req.session.sellerId;
        if (!ownerId) {
            req.flash('error', "User not logged in" );
            return res.redirect('/product/new');
        }

        let imageUrl;
        if (req.file) {
            imageUrl = req.file.path; 
        } else {
            imageUrl = "https://plus.unsplash.com/premium_photo-1722899516572-409bf979e5d6?q=80&w=1958&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
        }

        const product = new Product({
            title,
            Largedescription,
            Smalldescription,
            category,
            price,
            image: imageUrl,
            owner: ownerId,
        });

        await product.save();

        req.flash('success', "product created successfully");
        res.redirect('/seller/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error', "failed to create product");
        res.redirect('/seller/dashboard');
    }
};

exports.renderNewForm = async(req, res) =>{
    res.render('sellerPage/newPage.ejs');
};

exports.renderEditProductForm = async (req, res) => {
    try {
        const productId = req.params.id; 
        const product = await Product.findById(productId); 

        if (!product) {
            req.flash("error", "Product not found.");
            return res.redirect('/seller/dashboard');
        }

        res.render('sellerPage/editProduct.ejs', { product });
    } catch (error) {
        console.error("Error fetching product details:", error);
        req.flash("error", "An error occurred while fetching the product details.");
        res.redirect('/seller/dashboard');
    }
};

exports.updateProduct = async (req, res) => {
    const { title, price, Smalldescription, Largedescription, category } = req.body;
    let image = req.file ? req.file.path : req.body.image;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { title, price, Smalldescription, Largedescription, category, image },
            { new: true, runValidators: true } 
        );

        if (!updatedProduct) {
            req.flash('error_msg', 'Product not found');
            return res.redirect('/seller/dashboard');
        }
        
        req.flash('success_msg', 'Product updated successfully');
        res.redirect('/seller/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Server Error');
        res.redirect('/seller/dashboard'); 
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            req.flash('error_msg', 'Product not found');
            return res.redirect('/seller/dashboard');
        }

        req.flash('success_msg', 'Product deleted successfully');
        res.redirect('/seller/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Server Error'); 
        res.redirect('/seller/dashboard');
    }
};

exports.viewProduct = async (req, res) => { 
    try {
        const product = await Product.findById(req.params.id).populate('owner').exec();
        if (!product) return res.status(404).send('Product not found');

        const reviews = await ReviewProduct.find({ product: product._id })
            .populate('user', 'username')
            .exec();

        res.render('product', { product, reviews });
    } catch (error) {
        console.error(error);
        req.flash("error", "Some error occurred");
        res.redirect('/');
    }
};

exports.addReview = async (req, res) => {
    try {
        
        if (!req.user) {
            req.flash('error', 'Unauthorized. Please log in to submit a review.');
            return res.redirect('/login');
        }

        const { rating, comment } = req.body;
        const productId = req.params.productId;

        if (!rating || rating < 0 || rating > 5) {
            req.flash('error', 'Rating must be between 0 and 5.');
            return res.redirect('back');
        }

        const newReview = new ReviewProduct({
            product: productId,
            user: req.user._id,
            rating,
            comment,
        });

        await newReview.save();
        req.flash('success', 'Review added!');
        res.redirect(`/product/${productId}`);
    } catch (error) {
        console.error(error);
        req.flash('error', 'Server error. Please try again later.');
        res.redirect('back');
    }
};