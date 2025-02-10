const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/product.js');
const { storage } = require('../cloudConfig.js'); 
const upload = multer({ storage: storage });

router.post('/new', upload.single('image'), productController.createProduct);

router.get('/new', productController.renderNewForm );

router.get('/edit/:id', productController.renderEditProductForm);

router.post('/edit/:id', upload.single('image'), productController.updateProduct);

router.post('/delete/:id', productController.deleteProduct);

router.get('/:id', productController.viewProduct);

router.post('/:productId/review', productController.addReview);

module.exports = router;
