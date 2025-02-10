const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/seller.js');

router.get("/apply", sellerController.renderApplyPage);

router.post('/apply', sellerController.applyForSeller);

router.get("/status", sellerController.checkSellerStatusPage);

router.post('/check', sellerController.checkSellerStatus);

router.get('/login', sellerController.renderSellerLoginPage);

router.post('/login', sellerController.sellerLogin);

router.get('/dashboard', sellerController.renderDashboard);

router.get('/edit', sellerController.renderEditForm);

router.post('/edit', sellerController.updateSellerProfile);

module.exports = router;
