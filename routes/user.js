// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/user.js'); 
require('dotenv').config();


router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.get('/login-main', (req, res) =>{
    res.render("login-signup/loginMain.ejs");
} );

router.get("/login", (req, res) => {
    res.render("login-signup/login.ejs");
});

router.get('/weather', (req, res)=>{
    const weather_api = process.env.WEATHER_API_KEY;
    res.render("weather.ejs", {weather_api});
})

// Signup Page
router.get("/signup", (req, res) => {
    res.render("login-signup/signup.ejs");
});

router.get('/edit', authController.RenderEditForm);

router.post('/edit', authController.UpdateProfile);

router.get('/', authController.renderMain);

router.get('/search', authController.searchProducts);

router.get('/searchContractor', authController.searchContractor);

router.get('/commodity_price', authController.commodity_price);

module.exports = router;
