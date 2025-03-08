const Contractor = require('../model/contractor'); 
const Contract = require('../model/contract');
const Chat = require('../model/contractorUserChat');
const User = require("../model/user");
const Application = require('../model/application');

exports.renderApplyPage = (req, res) => {
    res.render("login-signup/applyContr.ejs"); 
}

exports.applyForContractor = async (req, res) => { 
    try {
        const { username, email, Pnumber, aadhar, district, password, latitude, longitude } = req.body;

        const existingContractor1 = await Contractor.findOne({ Pnumber });
        if (existingContractor1) {
            req.flash("error", "User with this number already exists!");
            return res.redirect('/contractor/apply');
        }

        const existingContractor2 = await Contractor.findOne({ aadhar });
        if (existingContractor2) {
            req.flash("error", "User with this Aadhar ID already exists!");
            return res.redirect('/contractor/apply');
        }

        const profileImageUrl = req.file ? req.file.path : undefined;

        let location = undefined;
        if (latitude && longitude) {
            location = {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)] 
            };
        }

        const newContractor = new Contractor({
            username,
            email,
            Pnumber,
            aadhar,
            district,
            image: profileImageUrl,
            location 
        });

        await Contractor.register(newContractor, password);

        req.flash("success", "Successfully applied to become a contractor!");
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash("error", "An error occurred while applying.");
        res.redirect('/contractor/apply');
    }
};



exports.checkContractorStatusPage = (req, res) => {
    res.render("contractorPage/status.ejs");
};

exports.checkContractorStatus = async (req, res) => {
    const { Pnumber, password } = req.body;

    try {
        const contractor = await Contractor.findOne({ Pnumber });
        
        if (!contractor) {
            req.flash("error", "Wrong phone number or password. Your application may have been rejected.");
            return res.redirect('/contractor/status');
        }

        contractor.authenticate(password, (err, result) => {
            if (err || !result) {
                req.flash("error", "Wrong phone number or password. Your application may have been rejected.");
                return res.redirect('/contractor/status');
            }

            if (contractor.valid) {
                req.flash("success", "Congratulations! Your application has been approved.");
            } else {
                req.flash("warning", "Your application is pending. Please note that it may still be rejected.");
            }
            
            return res.redirect('/contractor/status');
        });

    } catch (error) {
        console.error("Error checking contractor status:", error);
        req.flash("error", "An error occurred. Please try again later.");
        res.redirect('/contractor/status');
    }
};

exports.renderContractorLoginPage = (req, res) => {
    res.render("contractorPage/login.ejs");
};

exports.contractorLogin = async (req, res) => {
    const { Pnumber, password } = req.body;

    try {
        const contractor = await Contractor.findOne({ Pnumber });

        if (!contractor) {
            req.flash("error", "No contractor found with this phone number.");
            return res.redirect('/contractor/login');
        }

        contractor.authenticate(password, (err, result) => {
            if (err || !result) {
                req.flash("error", "Incorrect password. Please try again.");
                return res.redirect('/contractor/login');
            }

            if (!contractor.valid) {
                req.flash("warning", "Your account is not approved yet. Please wait for approval.");
                return res.redirect('/contractor/login');
            }

            req.flash("success", "Welcome back! You are now logged in.");
            req.session.contractorId = contractor._id; 
            return res.redirect('/');
        });

    } catch (error) {
        console.error("Error during contractor login:", error);
        req.flash("error", "An error occurred during login. Please try again later.");
        return res.redirect('/contractor/login');
    }
};

exports.renderDashboard = async (req, res) => { 
    try {
        const contractorId = req.session.contractorId;

        if (!contractorId) {
            req.flash('error', 'You need to log in first!');
            return res.redirect('/contractor/login');
        }

        const contracts = await Contract.find({ owner: contractorId });

        const chats = await Chat.find({ receiver: contractorId })
            .populate({
                path: 'messages.sender',
                select: 'username'
            })
            .sort({ 'messages.timestamp': -1 }); 

        let latestMessages = [];
        for (let chat of chats) {
            if (chat.messages.length > 0) {
                const latestMsg = chat.messages[chat.messages.length - 1];
                latestMessages.push({
                    senderId: latestMsg.sender._id, 
                    senderName: latestMsg.sender.username,
                    message: latestMsg.content, 
                    timestamp: latestMsg.timestamp
                });
            }
        }

        res.render('contractorPage/contractorDashboard', { contracts, latestMessages });

    } catch (err) {
        console.error("Error loading contractor's dashboard:", err);
        req.flash('error', 'An error occurred while loading your dashboard.');
        res.redirect('/');
    }
};


exports.renderEditForm = async (req, res) => {
    try {
        const contractorId = req.session.contractorId;

        const contractor = await Contractor.findById(contractorId);

        if (!contractor) {
            req.flash("error", "Contractor not found.");
            return res.redirect('/contractor/dashboard');
        }

        res.render('contractorPage/editProfile.ejs', { contractor });
    } catch (error) {
        console.error("Error fetching contractor details:", error);
        req.flash("error", "An error occurred while fetching your profile details.");
        res.redirect('/contractor/dashboard');
    }
};


exports.renderRequestList = async (req, res) => {
    try {
        const contractorId = req.session.contractorId;

        if (!contractorId) {
            return res.render('requests', { applications: [], message: "No contractor ID found in session." });
        }

        const applications = await Application.find({ contractorId: contractorId })
            .populate('userId', 'username email') 
            .populate('contractId', 'title') 
            .select('userId contractId message status appliedAt') 
            .sort({ appliedAt: -1 });

        if (applications.length === 0) {
            return res.render('requests', { applications: [], message: "No requests found." });
        }

        res.render('requests', { applications });
    } catch (error) {
        console.error("Error fetching contract applications:", error);
        res.status(500).render('requests', { applications: [], error: "Internal Server Error" });
    }
};


exports.updateContractorProfile = async (req, res) => {
    const { Pnumber, email, aadhar, district } = req.body;
    const contractorId = req.session.contractorId;
    
    try {
        const contractor = await Contractor.findById(contractorId);

        if (!contractor) {
            req.flash("error", "Contractor not found.");
            return res.redirect('/contractor/edit');
        }
        contractor.Pnumber = Pnumber;
        contractor.email = email;
        contractor.aadhar = aadhar;
        contractor.district = district;

        if (req.file) {
            contractor.image = `/uploads/${req.file.filename}`;
        }

        await contractor.save();

        req.flash("success", "Profile updated successfully.");
        res.redirect('/contractor/dashboard');

    } catch (error) {
        console.error("Error updating contractor profile:", error);

        if (error.code === 11000) {
            req.flash("error", "Duplicate entry: Aadhar or phone number already in use.");
        } else {
            req.flash("error", "An error occurred while updating your profile.");
        }
        res.redirect('/contractor/edit');
    }
};


exports.createChat = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { message } = req.body;

    let currentUser = req.user;
    if (!currentUser && req.session.contractorId) {
      currentUser = await Contractor.findById(req.session.contractorId);
    }
    
    if (!currentUser) {
      req.flash("error", "User not authenticated.");
      return res.redirect("/contractor/login");
    }

    const senderId = currentUser._id;
    const senderModel = req.user ? 'user' : 'Contractor';

    let receiverModel;
    const receiverIsUser = await User.findById(receiverId);
    const receiverIsContractor = await Contractor.findById(receiverId);

    if (receiverIsUser) {
      receiverModel = 'user';
    } else if (receiverIsContractor) {
      receiverModel = 'Contractor';
    } else {
      req.flash("error", "Invalid receiver ID.");
      return res.redirect("/chats");
    }

    let chat = await Chat.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (!chat) {
      chat = new Chat({
        sender: senderId,
        senderModel,
        receiver: receiverId,
        receiverModel,
        messages: []
      });
    }

    chat.messages.push({
      sender: senderId,
      senderModel,
      content: message
    });
    await chat.save();
    res.redirect(`/contractor/chat/${receiverId}`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Failed to send message.");
    res.redirect("/chats");
  }
};

exports.deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        await Chat.findByIdAndDelete(chatId);
        
        req.flash('success', 'Chat deleted successfully.');
        res.redirect('/chats');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to delete chat.');
        res.redirect('/chats');
    }
};

exports.renderChatPage = async (req, res) => {
  try {
    const { receiverId } = req.params;

    let currentUser = req.user;
    if (!currentUser && req.session.contractorId) {
      currentUser = await Contractor.findById(req.session.contractorId);
    }
    
    if (!currentUser) {
      req.flash('error', 'User not authenticated.');
      return res.redirect('/contractor/login');
    }

    const senderId = currentUser._id;
    const senderModel = req.user ? 'user' : 'Contractor';

    let receiver = await User.findById(receiverId);
    let receiverModel = 'user';
    if (!receiver) {
      receiver = await Contractor.findById(receiverId);
      receiverModel = 'Contractor';
    }
    if (!receiver) {
      req.flash('error', 'User not found.');
      return res.redirect('/');
    }

    let chat = await Chat.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    }).populate('messages.sender');

    if (!chat) {
      chat = new Chat({
        sender: senderId,
        senderModel: senderModel,
        receiver: receiverId,
        receiverModel: receiverModel,
        messages: []
      });
    } else {
      chat.messages.forEach(msg => {
        if (msg.sender.toString() !== senderId.toString() && !msg.read) {
          msg.read = true;
        }
      });
      await chat.save();
    }

    res.render('chat', {
      user: currentUser, 
      receiver,
      chat,
      messages: req.flash()
    });

  } catch (error) {
    console.error(error);
    req.flash('error', 'Error loading chat.');
    res.redirect('/');
  }
};

exports.acceptApplication = async (req, res) => {
    try {
        const applicationId = req.params.id;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).send("Application not found");
        }

        const contractId = application.contractId;

        await Application.findByIdAndUpdate(applicationId, { status: "Approved" });

        await Application.deleteMany({ contractId: contractId, _id: { $ne: applicationId } });

        await Contract.findByIdAndDelete(contractId);

        res.redirect('/contractor/requests');
    } catch (error) {
        console.error("Error accepting application:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.rejectApplication = async (req, res) => {
    try {
        const applicationId = req.params.id;

        await Application.findByIdAndDelete(applicationId);

        res.redirect('/contractor/requests');
    } catch (error) {
        console.error("Error rejecting application:", error);
        res.status(500).send("Internal Server Error");
    }
};
