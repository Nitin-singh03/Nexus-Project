const User = require("../model/user.js");
const passport = require("passport");
const Product = require('../model/product');
const Contract = require("../model/contract");
const Contractor =require('../model/contractor');

const ContractorReview = require('../model/contractorReview.js');

exports.signup = async (req, res) => {
    const { Pnumber, username, email, password } = req.body;
    console.log(Pnumber);
    try {
        const newUser = new User({ Pnumber, username, email });
        await User.register(newUser, password); 
        req.login(newUser, (err) => {
            if (err) {
                console.error('Login error:', err);
                return res.redirect('/signup'); 
            }
            req.session.user = newUser._id; 
            req.flash("success", "Welcome to AgroGuide");
            res.redirect('/'); 
        });
    } catch (error) {
        console.error('Error saving user:', error);
        if (error.code === 11000) {
            req.flash("error", "User already exists");
            return res.redirect("/signup");
        }
        req.flash("error", "Some error occurred");
        res.redirect("/signup"); 
    }
};

exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Authentication error:', err);
            return next(err);
        }
        if (!user) {
            req.flash("error", "Phone Number or Password is wrong");
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                return next(err);
            }
            req.session.user = user._id; 
            req.flash("success", "Welcome Back to AgroGuide");
            return res.redirect('/');
        });
    })(req, res, next);
};

exports.logout = (req, res) => {
    req.logout(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Could not log out. Please try again.');
        }
        res.clearCookie('connect.sid');
        req.flash("success", "You are logged out!");
        res.redirect('/'); 
    });
};

exports.renderMain = async (req, res) => {
    try {
        const products = await Product.find().populate('owner').sort('category');

        const categories = [...new Set(products.map(product => product.category))];
        res.render('index2', { products, categories});
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.RenderEditForm = async (req, res) => {
    try {
        const user = await User.findById(req.session.user);
        res.render('edit', { user }); 
    } catch (err) {
        console.error(err);
        req.flash("error", 'some error occurred');
        res.redirect('/');
    }
};

exports.UpdateProfile = async (req, res) => {
    const {username, Pnumber, email } = req.body; 
    try {
        await User.findByIdAndUpdate(req.session.user, {username ,Pnumber, email });
        req.flash("success", 'Uodated Successfully!');
        res.redirect('/');
    } catch (err) {
        req.flash("error", 'some error occurred');
        res.redirect('/');
    }
}

exports.searchProducts = async (req, res) => {
    const { query, sort } = req.query;
    let filter = {};

    if (query) {
        filter = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
            ]
        };
    }


    try {
        let products = await Product.find(filter).populate('owner');
        if (sort === 'low-high') {
            products = products.sort((a, b) => a.price - b.price);
        } else if (sort === 'high-low') {
            products = products.sort((a, b) => b.price - a.price);
        }

        res.render('searchResults', { products, query, sort });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Server Error');
    }
};

exports.searchContractor = async (req, res) => {
    const { query, sort } = req.query;
    let contractorIds = [];

    try {
        if (query && query.trim() !== '') {
            const contractors = await Contractor.find({
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { district: { $regex: query, $options: 'i' } },
                ]
            });

            contractorIds = contractors.map(contractor => contractor._id);
        }

        let filter = contractorIds.length > 0 ? { owner: { $in: contractorIds } } : {};

        let contracts;
        let sortOption = {};
        if (sort) {
            const lowerSort = sort.toLowerCase();
            if (lowerSort === 'low-high') sortOption.area = 1;
            else if (lowerSort === 'high-low') sortOption.area = -1;
        }

        contracts = await Contract.find(filter).populate('owner').sort(sortOption);

        console.log('Contracts Found:', contracts.length);
        res.render('contractor_search', { contracts, query, sort });

    } catch (error) {
        console.error('Error fetching contracts:', error);
        res.status(500).send('Server Error');
    }
};

exports.commodity_price = async(req, res) => {
    res.render('CommodityPrice.ejs');
};

