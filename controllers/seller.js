const Seller = require('../model/seller');
const Product = require('../model/product');

exports.applyForSeller = async (req, res) => {
    const { Pnumber, username, email, aadhar, district, companyName, password } = req.body;
    try {
        const existingSeller = await Seller.findOne({ $or: [{ Pnumber }, { aadhar }] });
        if (existingSeller) {
            req.flash("error", "A user with this number or Aadhar already exists!");
            return res.redirect('/seller/apply');
        }

        const newSeller = new Seller({
            Pnumber,
            username,
            email,
            aadhar,
            district,
            companyName
        });

        await Seller.register(newSeller, password);
        req.flash("success", "Successfully applied to become a Seller");
        res.redirect('/'); 
    } catch (error) {
        console.error('Error saving Seller:', error); 
        
        if (error.code === 11000) {
            req.flash("error", "Already applied with this Aadhar or phone number or email");
            return res.redirect('/seller/apply');
        }
        
        req.flash("error", "Some error occurred, try again later");
        res.redirect('/seller/apply');
    }
};

exports.renderApplyPage = (req, res) => {
    res.render("login-signup/applySeller.ejs");
};

exports.checkSellerStatusPage = (req, res) => {
    res.render("sellerPage/status.ejs");
};

exports.checkSellerStatus = async (req, res) => {
    const { Pnumber, password } = req.body;

    try {
        const seller = await Seller.findOne({ Pnumber });
        
        if (!seller) {
            req.flash("error", "Wrong phone number or password. Your application may have been rejected.");
            return res.redirect('/seller/status');
        }

        seller.authenticate(password, (err, result) => {
            if (err || !result) {
                req.flash("error", "Wrong phone number or password. Your application may have been rejected.");
                return res.redirect('/seller/status');
            }

            if (seller.valid) {
                req.flash("success", "Congratulations! Your application has been approved.");
            } else {
                req.flash("warning", "Your application is pending. Please note that it may still be rejected.");
            }
            
            return res.redirect('/seller/status');
        });

    } catch (error) {
        console.error("Error checking seller status:", error);
        req.flash("error", "An error occurred. Please try again later.");
        res.redirect('/seller/status');
    }
};

exports.renderSellerLoginPage = (req, res) => {
    res.render("sellerPage/login.ejs");
};

exports.sellerLogin = async (req, res) => {
    const { Pnumber, password } = req.body;

    try {
        const seller = await Seller.findOne({ Pnumber });

        if (!seller) {
            req.flash("error", "No seller found with this phone number.");
            return res.redirect('/seller/login');
        }

        seller.authenticate(password, (err, result) => {
            if (err || !result) {
                req.flash("error", "Incorrect password. Please try again.");
                return res.redirect('/seller/login');
            }

            if (!seller.valid) {
                req.flash("warning", "Your account is not approved yet. Please wait for approval.");
                return res.redirect('/seller/login');
            }

            req.flash("success", "Welcome back! You are now logged in.");
            req.session.sellerId = seller._id;
            return res.redirect('/');
        });

    } catch (error) {
        console.error("Error during seller login:", error);
        req.flash("error", "An error occurred during login. Please try again later.");
        return res.redirect('/seller/login');
    }
};

exports.renderDashboard = async (req, res) => {
    try {
        const sellerId = req.session.sellerId;

        if (!sellerId) {
            req.flash('error', 'You need to log in first!');
            return res.redirect('/seller/login');
        }

        const products = await Product.find({ owner: sellerId });

        res.render('sellerPage/sellerDashboard', { products });
    } catch (err) {
        console.error("Error loading seller's dashboard:", err);
        req.flash('error', 'An error occurred while loading your dashboard.');
        res.redirect('/');
    }
};

exports.renderEditForm = async (req, res) => {
    try {
        const sellerId = req.session.sellerId;

        const seller = await Seller.findById(sellerId);

        if (!seller) {
            req.flash("error", "Seller not found.");
            return res.redirect('/seller/dashboard');
        }

        res.render('sellerPage/editProfile.ejs', { seller });
    } catch (error) {
        console.error("Error fetching seller details:", error);
        req.flash("error", "An error occurred while fetching your profile details.");
        res.redirect('/seller/dashboard');
    }
};

exports.updateSellerProfile = async (req, res) => {
    const { Pnumber, username, email, aadhar, district, companyName } = req.body;
    const sellerId = req.session.sellerId;

    try {
        const seller = await Seller.findById(sellerId);

        if (!seller) {
            req.flash("error", "Seller not found.");
            return res.redirect('/seller/edit');
        }

        seller.Pnumber = Pnumber;
        seller.username = username;
        seller.email = email;
        seller.aadhar = aadhar;
        seller.district = district;
        seller.companyName = companyName;

        await seller.save();

        req.flash("success", "Profile updated successfully.");
        res.redirect('/seller/dashboard');

    } catch (error) {
        console.error("Error updating seller profile:", error);

        if (error.code === 11000) {
            req.flash("error", "Duplicate entry: Aadhar or phone number already in use.");
        } else {
            req.flash("error", "An error occurred while updating your profile.");
        }
        res.redirect('/seller/edit');
    }
};



