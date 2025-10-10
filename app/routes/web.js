const express = require('express');
const { userRegister, login } = require('../controller/auth/login');
// const { login, logout, AIlogin,Applogin, verifyOtp, Applogout } = require('../controller/auth/login');
// const {Admin, AppAdmin} = require('../middleware/auth');
const router = express.Router();

router.post('/registration',userRegister)
router.post('/login',login)
module.exports = router