const User = require("../model/user.js");
const passport = require("passport");
const Product = require('../model/product');
const Contract = require("../model/contract");
const Contractor =require('../model/contractor');
const ReviewProduct = require('../model/productReview.js');
const ContractorReview = require('../model/contractorReview.js');
const WorkStatus = require('../model/workStatus.js');
const Chat =require('../model/contractorUserChat.js');
const Application = require('../model/application.js');

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

        // Fetch and calculate average rating for each product
        const productRatings = await ReviewProduct.aggregate([
            { $group: { _id: "$product", avgRating: { $avg: "$rating" } } }
        ]);

        // Create a map of productId -> avgRating
        const ratingMap = {};
        productRatings.forEach(r => ratingMap[r._id.toString()] = r.avgRating.toFixed(1));

        // Attach average rating to products
        const productsWithRatings = products.map(product => ({
            ...product.toObject(),
            avgRating: ratingMap[product._id.toString()] || "No ratings yet"
        }));

        const categories = [...new Set(products.map(product => product.category))];

        let isLookingForWork = false;

        if (req.user) {
            const workStatus = await WorkStatus.findOne({ userId: req.user._id });
            isLookingForWork = !!workStatus;
        }

        res.render('index2', { 
            products: productsWithRatings, 
            categories,
            isLookingForWork 
        });
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
        req.flash("success", 'Updated Successfully!');
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
        let products = await Product.find(filter)
            .populate('owner') // Populate the owner of the product
            .lean(); // Convert documents to plain objects for easier manipulation

        // Fetch and attach reviews & average rating for each product
        for (let product of products) {
            const reviews = await ReviewProduct.find({ product: product._id }).populate('user');
            product.reviews = reviews; // Attach reviews to product
            
            // Calculate average rating
            if (reviews.length > 0) {
                const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
                product.avgRating = avgRating.toFixed(1); // Round to 1 decimal place
            } else {
                product.avgRating = "No Ratings Yet";
            }
        }

        // Sort products if sorting is applied
        if (sort === 'low-high') {
            products.sort((a, b) => a.price - b.price);
        } else if (sort === 'high-low') {
            products.sort((a, b) => b.price - a.price);
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

exports.toggle_work = async (req, res) => {
  try {
    console.log("request body", req.body);
    const { userId, latitude, longitude } = req.body;

    let existingStatus = await WorkStatus.findOne({ userId });

    if (existingStatus) {
      await WorkStatus.deleteOne({ userId });
      req.flash("success", 'Work mode turned off');
      return res.redirect('/');
    } else {
      await WorkStatus.create({ userId, latitude, longitude, status: true });
      req.flash("success", 'Ready to work mode turned On');
      return res.redirect('/');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.nearby = async (req, res) => {
  try {
    const userId = req.params.userId;

    const userLocation = await WorkStatus.findOne({ userId });

    if (!userLocation) {
      return res.status(404).json({ error: "User location not found" });
    }

    const { latitude, longitude } = userLocation;

    // Find nearby contractors (within 10km)
    const nearbyContractors = await Contractor.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: 100000
        }
      }
    });

    console.log(nearbyContractors);

    // Extract contractor IDs
    const contractorIds = nearbyContractors.map(con => con._id);

    // Fetch contracts and count per contractor
    const contracts = await Contract.find({ owner: { $in: contractorIds } })
      .populate("owner")
      .lean();

    // Count contracts per contractor
    const contractorData = {};
    contracts.forEach(contract => {
      const contractorId = contract.owner._id;
      if (!contractorData[contractorId]) {
        contractorData[contractorId] = {
          contractor: contract.owner,
          contracts: [],
          contractCount: 0
        };
      }
      contractorData[contractorId].contracts.push(contract);
      contractorData[contractorId].contractCount++;
    });

    const contractorList = Object.values(contractorData);

    // Render EJS view with contractor data
    res.render("contractsNearby", { 
      contractorList, 
      userLocation: { latitude, longitude } 
    });
    console.log(contractorList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};


exports.getContractorMessages = async (req, res) => {
    try {
        const userId = req.params.userId; // Get the logged-in user's ID

        // Find the latest message from each contractor
        const messages = await Chat.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { receiver: userId }]
                }
            },
            { $unwind: "$messages" }, // Flatten messages array
            { $sort: { "messages.timestamp": -1 } }, // Sort messages by latest
            {
                $group: {
                    _id: {
                        contractor: {
                            $cond: {
                                if: { $eq: ["$senderModel", "Contractor"] },
                                then: "$sender",
                                else: "$receiver"
                            }
                        }
                    },
                    latestMessage: { $first: "$messages" }
                }
            },
            {
                $lookup: {
                    from: "contractors",
                    localField: "_id.contractor",
                    foreignField: "_id",
                    as: "contractor"
                }
            },
            { $unwind: "$contractor" } // Convert contractor array into object
        ]);

        res.render("messages", { messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).send("Error fetching messages");
    }
};



exports.applyForContract = async (req, res) => {
    try {
        const { contractId } = req.params;
        const { message } = req.body;
        const userId = req.user; 

        if (!userId) return res.redirect('/login');

        // Check if the contract exists
        const contractExists = await Contract.findById(contractId);
        if (!contractExists) {
            return res.status(404).json({ error: "Contract not found" });
        }

        // Create a new application with status "pending"
        const newApplication = new Application({
            contractId,
            contractorId: contractExists.owner, // Corrected to use contractExists
            userId,
            message,
            status: "pending"
        });

        await newApplication.save();
        req.flash("success", "Application submitted successfully!");
        res.redirect(`/contract/${contractId}`);
    } catch (error) {
        console.error("Error applying for contract:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.applicationStatus = async (req, res) => {
    try {
        const userId = req.user; // Ensure it's `req.user`, not `req.User`
        if (!userId) return res.redirect('/login');

        const applications = await Application.find({ userId })
            .populate('contractId', 'title') // Get contract title
            .populate('contractorId', 'username') // Get contractor name
            .select('contractId contractorId message status appliedAt') // Fetch required fields
            .sort({ appliedAt: -1 });

        console.log("Applications fetched:", applications);

        res.render('applicationStatus', { applications });
    } catch (error) {
        console.error("Error fetching application status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
