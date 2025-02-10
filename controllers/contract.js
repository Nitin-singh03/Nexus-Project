const Contract = require('../model/contract');

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

// Delete Contract
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

        res.render('contract', { contract });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Server Error');
        res.redirect('/');
    }
};
