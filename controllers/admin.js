const Admin = require("../model/admin.js");
const Seller = require('../model/seller');
const Product = require('../model/product');
const Contractor = require('../model/contractor');
const Contract = require('../model/contract');
const User = require("../model/user.js");

exports.renderLoginPage = async(req, res) =>{
    res.render('adminPage/login.ejs');
};

exports.login = async (req, res) => {

    const { Pnumber, password } = req.body;

    try {
        const admin = await Admin.findOne({ Pnumber });

        if (!admin) {
            req.flash("error", "No admin found with this phone number.");
            return res.redirect('/admin/login');
        }

        admin.authenticate(password, (err, result) => {

            if (err || !result) {
                req.flash("error", "Incorrect password. Please try again.");
                return res.redirect('/admin/login');
            }

            req.flash("success", "Welcome back! You are now logged in.");
            req.session.adminId = admin._id;
            return res.redirect('/admin/dashboard');
        });

    } catch (error) {
        console.error("Error during admin login:", error);
        req.flash("error", "An error occurred during login. Please try again later.");
        return res.redirect('/admin/login');
    }
};

exports.renderDashboard = async (req, res) => {
    try {
        const userCount = await User.countDocuments({});
        const contractorValidCount = await Contractor.countDocuments({ valid: true });
        const contractorInvalidCount = await Contractor.countDocuments({ valid: false });
        const sellerValidCount = await Seller.countDocuments({ valid: true });
        const sellerInvalidCount = await Seller.countDocuments({ valid: false });
        const contractCount = await Contract.countDocuments({});
        const productCount = await Product.countDocuments({});

        res.render('adminPage/dashboard', {
            userCount,
            contractorValidCount,
            contractorInvalidCount,
            sellerValidCount,
            sellerInvalidCount,
            contractCount,
            productCount
        });
    } catch (error) {
        console.error("Error fetching counts for dashboard:", error);
        req.flash("error", "Unable to load dashboard data. Please try again later.");
        return res.redirect('/admin/login');
    }
};

exports.renderContractorList = async (req, res) => {
  try {
    const invalidContractors = await Contractor.find({ valid: false });
    const contractorInvalidCount = await Contractor.countDocuments({ valid: false });
    const sellerInvalidCount = await Seller.countDocuments({ valid: false });
    res.render('adminPage/contractorRequests', { contractors: invalidContractors, sellerInvalidCount, contractorInvalidCount} );
  } catch (error) {
    console.error('Error fetching invalid contractors:', error);
    req.flash('error', 'An error occurred while fetching the contractors.');
    res.redirect('/admin/dashboard');
  }
};

exports.acceptContractor = async (req, res) => {
  try {
    const contractorId = req.params.id;
    await Contractor.findByIdAndUpdate(contractorId, { valid: true });

    req.flash('success', 'Contractor accepted successfully!');
    res.redirect('/admin/contractorRequests');
  } catch (error) {
    console.error('Error accepting contractor:', error);
    req.flash('error', 'An error occurred while accepting the contractor.');
    res.redirect('/admin/contractorRequests');
  }
};

exports.rejectContractor = async (req, res) => {
  try {
    const contractorId = req.params.id;
    await Contractor.findByIdAndDelete(contractorId);

    req.flash('success', 'Contractor rejected successfully!');
    res.redirect('/admin/contractorRequests');
  } catch (error) {
    console.error('Error rejecting contractor:', error);
    req.flash('error', 'An error occurred while rejecting the contractor.');
    res.redirect('/admin/contractorRequests');
  }
};

exports.renderSellerList = async (req, res) => {
    try {
      const invalidSellers = await Seller.find({ valid: false });
      const sellerInvalidCount = await Seller.countDocuments({ valid: false });
      const contractorInvalidCount = await Contractor.countDocuments({ valid: false });
      res.render('adminPage/sellerRequests', {
        sellers: invalidSellers, 
        sellerInvalidCount,
        contractorInvalidCount
      });
    } catch (error) {
      console.error('Error fetching invalid sellers:', error);
      req.flash('error', 'An error occurred while fetching the sellers.');
      res.redirect('/admin/dashboard');
    }
  };
  
  
  exports.acceptSeller = async (req, res) => {
    try {
      const sellerId = req.params.id;
      await Seller.findByIdAndUpdate(sellerId, { valid: true });
  
      req.flash('success', 'Seller accepted successfully!');
      res.redirect('/admin/sellerRequests');
    } catch (error) {
      console.error('Error accepting seller:', error);
      req.flash('error', 'An error occurred while accepting the seller.');
      res.redirect('/admin/sellerRequests');
    }
  };
  
  
exports.rejectSeller = async (req, res) => {
  try {
    const sellerId = req.params.id;
    await Seller.findByIdAndDelete(sellerId);

    req.flash('success', 'Seller rejected successfully!');
    res.redirect('/admin/sellerRequests');
  } catch (error) {
    console.error('Error rejecting seller:', error);
    req.flash('error', 'An error occurred while rejecting the seller.');
    res.redirect('/admin/sellerRequests');
  }
};


exports.renderUserList = async (req, res) => {
  try {
    const perPage = 50;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.search || "";

    let users, totalUsers;
    let searchedUser = null;

    if (searchQuery) {
      searchedUser = await User.findOne({ Pnumber: searchQuery });
      users = await User.find()
        .skip((page - 1) * perPage)
        .limit(perPage);
      totalUsers = await User.countDocuments();
    } else {
      users = await User.find()
        .skip((page - 1) * perPage)
        .limit(perPage);
      totalUsers = await User.countDocuments();
    }
    const sellerInvalidCount = await Seller.countDocuments({ valid: false });
    const contractorInvalidCount = await Contractor.countDocuments({ valid: false });

    res.render('adminPage/userList', {
      users,
      searchedUser,
      searchQuery,
      sellerInvalidCount,
      contractorInvalidCount,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / perPage),
    });
  } catch (error) {
    console.error('Error rendering user list:', error);
    req.flash('error', 'An error occurred while fetching the user list.');
    res.redirect('/admin/dashboard');
  }
};
  
exports.renderContractorListing =  async (req, res) => {
    const { page = 1, search = "" } = req.query;
    const searchQuery = search.trim();

    const limit = 10;

    try {
        const searchRegex = new RegExp(searchQuery, "i");
        const contractors = await Contractor.find({
            $or: [
                { Pnumber: searchRegex },
                { aadhar: searchRegex }
            ]
        })
        .skip((page - 1) * limit)
        .limit(limit);

        const totalContractors = await Contractor.countDocuments({
            $or: [
                { Pnumber: searchRegex },
                { aadhar: searchRegex }
            ]
        });

        const searchedContractor = searchQuery ? contractors[0] : null;
        const sellerInvalidCount = await Seller.countDocuments({ valid: false });
      const contractorInvalidCount = await Contractor.countDocuments({ valid: false });

        res.render("adminPage/contractorList", {
            sellerInvalidCount,
        contractorInvalidCount,
            contractors,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalContractors / limit),
            searchQuery,
            searchedContractor
        });
    } catch (error) {
        console.error("Error fetching contractors:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.deleteContractor = async (req, res) => {
  try {
      const contractorId = req.params.id;

      await Contract.deleteMany({ owner: contractorId });

      await Contractor.findByIdAndDelete(contractorId);

      req.flash('success', 'Deleted Successfully');
      res.redirect('/admin/contractors'); 
  } catch (err) {
      console.error(err);
      req.flash('error', 'Some error occurred');
      res.redirect('/admin/contractors'); 
  }
};


exports.renderContractor =  async (req, res) => {
    const contractorId = req.params.id;

    try {
        const contracts = await Contract.find({ owner: contractorId }).populate("owner");
        const contractor = await Contractor.findById(contractorId);

        const sellerInvalidCount = await Seller.countDocuments({ valid: false });
        const contractorInvalidCount = await Contractor.countDocuments({ valid: false });

        res.render("adminPage/contractorDetail", {
            sellerInvalidCount,
            contractorInvalidCount,
            contractor,
            contracts,
        });
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

exports.renderSellerListing = async (req, res) => {
    const { page = 1, search = "" } = req.query;
    const searchQuery = search.trim();

    const limit = 10;

    try {
        const searchRegex = new RegExp(searchQuery, "i");
        const sellers = await Seller.find({
            $or: [
                { Pnumber: searchRegex },
                { aadhar: searchRegex },
                { companyName: searchRegex },
                { district: searchRegex },
            ]
        })
        .skip((page - 1) * limit)
        .limit(limit);

        const totalSellers = await Seller.countDocuments({
            $or: [
                { Pnumber: searchRegex },
                { aadhar: searchRegex },
                { companyName: searchRegex },
                { district: searchRegex },
            ]
        });

        const searchedSeller = searchQuery ? sellers[0] : null;
        const sellerInvalidCount = await Seller.countDocuments({ valid: false });
        const contractorInvalidCount = await Contractor.countDocuments({ valid: false });

        res.render("adminPage/sellerList", {
            sellerInvalidCount,
            contractorInvalidCount,
            sellers,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalSellers / limit),
            searchQuery,
            searchedSeller,
        });
    } catch (error) {
        console.error("Error fetching sellers:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.deleteSeller = async (req, res) => {
    try {
        const sellerId = req.params.id;

        await Product.deleteMany({ owner: sellerId });

        await Seller.findByIdAndDelete(sellerId);

        req.flash('success', 'Seller deleted successfully');
        res.redirect('/admin/sellers');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Some error occurred');
        res.redirect('/admin/sellers');
    }
};

exports.renderProductListing = async (req, res) => {
  const sellerId = req.params.id;

  try {
      const products = await Product.find({ owner: sellerId });

      const sellerInvalidCount = await Seller.countDocuments({ valid: false });
      const contractorInvalidCount = await Contractor.countDocuments({ valid: false });

      res.render("adminPage/sellerDetail", {
          sellerInvalidCount,
          contractorInvalidCount,
          products,
      });
  } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).send("Server Error");
  }
};

exports.renderProductList = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10; 
      const skip = (page - 1) * limit;

      const products = await Product.find()
          .populate('owner', 'username email Pnumber') 
          .skip(skip)
          .limit(limit);

      const totalProducts = await Product.countDocuments();
      const totalPages = Math.ceil(totalProducts / limit);
      const sellerInvalidCount = await Seller.countDocuments({ valid: false });
      const contractorInvalidCount = await Contractor.countDocuments({ valid: false });

      res.render('adminPage/productList', {
          layout: '/adminPage/layouts/boilerplate',
          products,
          currentPage: page,
          totalPages,
          sellerInvalidCount,
          contractorInvalidCount,
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
  }
};

exports.renderContractList = async (req, res) => {
  try {
      const contractPage = parseInt(req.query.page) || 1;
      const contractLimit = 10; 
      const contractSkip = (contractPage - 1) * contractLimit;

      const contracts = await Contract.find()
          .populate('owner', 'username email Pnumber')
          .skip(contractSkip)
          .limit(contractLimit);

      const totalContracts = await Contract.countDocuments();
      const totalPages = Math.ceil(totalContracts / contractLimit);

      const sellerInvalidCount = await Seller.countDocuments({ valid: false });
      const contractorInvalidCount = await Contractor.countDocuments({ valid: false });

      res.render('adminPage/contractList', {
          layout: '/adminPage/layouts/boilerplate',
          contracts,
          currentPage: contractPage,
          totalPages,
          sellerInvalidCount,
          contractorInvalidCount,
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
  }
};
