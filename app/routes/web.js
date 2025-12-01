const express = require('express');
const { userRegister, login } = require('../controller/auth/login');
const { UserRegistration, Userlogin } = require('../controller/admin/account');
const { AppsendOtp, AppverifyOtp } = require('../controller/admin/app');
// const { login, logout, AIlogin,Applogin, verifyOtp, Applogout } = require('../controller/auth/login');
// const {Admin, AppAdmin} = require('../middleware/auth');
const router = express.Router();

router.post('/registration',userRegister)
router.post('/login',login)
router.post('/register',UserRegistration)
router.post('/user-login',Userlogin)
router.post('/app-send-otp',AppsendOtp)
router.post('/app-verify-otp',AppverifyOtp)
module.exports = router