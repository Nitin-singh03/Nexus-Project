const Contract = require('../model/contract');
const ContractorReview = require('../model/contractorReview.js');
const Contractor =require('../model/contractor');

exports.renderNewForm = async(req, res) =>{
    res.render('contractorPage/newPage.ejs');
};

exports.createContract = async (req, res) => {
    try {
        const { area, rent, rent_type, terms } = req.body;

        const ownerId = req.session.contractorId;
        if (!ownerId) {
            req.flash('error', "User not logged in");
            return res.redirect('/contract/new');
        }

        const contract = new Contract({
            area,
            rent,
            rent_type,
            terms,
            owner: ownerId
        });

        await contract.save();
        req.flash('success', "Contract created successfully");
        res.redirect('/contractor/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error', "Failed to create contract");
        res.redirect('/contract/new'); 
    }
};

exports.renderEditContractForm = async (req, res) => {
    try {
        const contractId = req.params.id; 
        const contract = await Contract.findById(contractId); 

        if (!contract) {
            req.flash("error", "Contract not found.");
            return res.redirect('/contractor/dashboard');
        }

        res.render('contractorPage/editContract.ejs', { contract });
    } catch (error) {
        console.error("Error fetching contract details:", error);
        req.flash("error", "An error occurred while fetching the contract details.");
        res.redirect('/contractor/dashboard');
    }
};


exports.updateContract = async (req, res) => {
    const { area, rent, rent_type, terms } = req.body;

    try {
        const updatedContract = await Contract.findByIdAndUpdate(
            req.params.id,
            { area, rent, rent_type, terms},
            { new: true, runValidators: true }
        );

        if (!updatedContract) {
            req.flash('error', 'Contract not found');
            return res.redirect('/contractor/dashboard');
        }

        req.flash('success', 'Contract updated successfully');
        res.redirect('/contractor/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Server Error');
        res.redirect('/contractor/dashboard');
    }
};

exports.deleteContract = async (req, res) => {
    try {
        const deletedContract = await Contract.findByIdAndDelete(req.params.id);

        if (!deletedContract) {
            req.flash('error', 'Contract not found');
            return res.redirect('/contractor/dashboard');
        }

        req.flash('success', 'Contract deleted successfully');
        res.redirect('/contractor/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Server Error');
        res.redirect('/contractor/dashboard');
    }
};

exports.viewContract = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id).populate('owner').exec();
        
        if (!contract) {
            req.flash('error', 'Contract not found');
            return res.redirect('/');
        }

        const contractorId = contract.owner?._id;

        if (!contractorId) {
            req.flash('error', 'Contractor not found for this contract');
            return res.redirect('/');
        }

        const contractor = await Contractor.findById(contractorId).exec();

        const reviews = await ContractorReview.find({ contractor: contractorId })
            .populate('user', 'username')
            .exec();

        res.render('contract', { contract, contractor, reviews });
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong.");
        res.redirect('/');
    }
};



exports.addReviewContractor = async (req, res) => {
    try {
        if (!req.user) {
            req.flash('error', 'Unauthorized. Please log in to submit a review.');
            return res.redirect('/login');
        }

        const { rating, comment } = req.body;
        const contractId = req.params.id;

        const contract = await Contract.findById(contractId);
        if (!contract) {
            req.flash('error', 'Contract not found.');
            return res.redirect('back');
        }

        const contractorId = contract.owner;

        if (!rating || rating < 0 || rating > 5) {
            req.flash('error', 'Rating must be between 0 and 5.');
            return res.redirect('back');
        }

        const newReview = new ContractorReview({
            contractor: contractorId,
            user: req.user._id,
            rating,
            comment,
        });

        await newReview.save();
        req.flash('success', 'Review added!');
        res.redirect(`/contract/${contractId}`);
    } catch (error) {
        console.error("Error while adding review:", error);
        req.flash('error', 'Server error. Please try again later.');
        res.redirect('back');
    }
};
