const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.js');

router.get('/new', contractController.renderNewForm );

router.post('/new', contractController.createContract);

router.get('/edit/:id', contractController.renderEditContractForm);

router.post('/edit/:id', contractController.updateContract);

router.post('/delete/:id', contractController.deleteContract);

router.get('/:id', contractController.viewContract);

module.exports = router;
