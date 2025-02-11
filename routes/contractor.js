const express = require('express');
const router = express.Router();
const contractorController = require('../controllers/contractor.js');
const multer = require('multer');
const { storage } = require('../cloudConfig.js'); 
const upload = multer({ storage: storage });
const { isAuthenticated, isAuthorized } = require("../authMiddleware");

router.get("/apply", contractorController.renderApplyPage);

router.post('/apply', upload.single('image'), contractorController.applyForContractor);

router.get("/status", contractorController.checkContractorStatusPage);

router.post('/check', contractorController.checkContractorStatus);

router.get('/login', contractorController.renderContractorLoginPage);

router.post('/login', contractorController.contractorLogin);

router.get('/dashboard', contractorController.renderDashboard);

router.get('/edit', contractorController.renderEditForm);

router.get('/requests', contractorController.renderRequestList);

router.post('/edit', upload.single('image'), contractorController.updateContractorProfile);

// ✅ Send a message (User ↔ Contractor)
router.post('/chat/:receiverId', contractorController.createChat);

// ❌ Delete chat
router.delete('/chat/:chatId', contractorController.deleteChat);

router.get('/chat/:receiverId', contractorController.renderChatPage);

router.post('/accept/:id', contractorController.acceptApplication);

router.post('/reject/:id', contractorController.rejectApplication);

module.exports = router;
