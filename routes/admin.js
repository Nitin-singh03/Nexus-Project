const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.js');

router.get('/login', adminController.renderLoginPage);

router.post('/login', adminController.login);

router.get('/dashboard', adminController.renderDashboard);

router.get('/contractorRequests', adminController.renderContractorList);

router.get('/accept-contractor/:id', adminController.acceptContractor);

router.get('/reject-contractor/:id', adminController.rejectContractor);

router.get('/sellerRequests', adminController.renderSellerList);

router.get('/accept-seller/:id', adminController.acceptSeller);

router.get('/reject-seller/:id', adminController.rejectSeller);

router.get('/users', adminController.renderUserList); 

router.get("/contractors", adminController.renderContractorListing);

router.post('/contractor/:id', adminController.deleteContractor);

router.get("/contractor/:id/listings", adminController.renderContractor);

router.get("/sellers", adminController.renderSellerListing);

router.post('/seller/:id', adminController.deleteSeller);

router.get("/seller/:id/listings", adminController.renderProductListing);

router.get('/products', adminController.renderProductList); 

router.get('/contracts', adminController.renderContractList);

module.exports = router;