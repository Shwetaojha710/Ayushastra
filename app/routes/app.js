const express = require('express');

const { AppsendOtp, AppverifyOtp, UserProfile,UpdateUserProfile, checkToken, Verifycredential, SendOtpcredential, verifyOtpcredential, getappProduct, AppaddCart, getAllMasterDD, getSubCategory, getCheckOutCartList, getAppCartList, addAppAddress, getAppAddressList, updateAppAddress } = require('../controller/admin/app');
const {  publicRegisteredAdmin } = require('../middleware/auth');
// const { login, logout, AIlogin,Applogin, verifyOtp, Applogout } = require('../controller/auth/login');
// const {Admin, AppAdmin} = require('../middleware/auth');
const router = express.Router();

router.get('/user-profile',publicRegisteredAdmin,UserProfile)
router.post('/update-user-profile',publicRegisteredAdmin,UpdateUserProfile)
router.get('/check-token',checkToken)
router.post('/send-otp-credential',publicRegisteredAdmin,SendOtpcredential)
router.post('/verify-otp-credential',publicRegisteredAdmin,verifyOtpcredential)
router.post("/app-product",publicRegisteredAdmin,getappProduct)
router.post("/app-add-cart",publicRegisteredAdmin,AppaddCart)
router.get("/get-all-master-dd",publicRegisteredAdmin,getAllMasterDD)
router.post("/get-sub-category",publicRegisteredAdmin,getSubCategory)
router.post("/app-cart-list",publicRegisteredAdmin,getAppCartList)
// router.post("/order-checkout",publicRegisteredAdmin,getAppCartList)
router.post("/app-add-addresses",publicRegisteredAdmin,addAppAddress)
router.get("/app-list-addresses",publicRegisteredAdmin,getAppAddressList)
router.post("/app-update-addresses",publicRegisteredAdmin,updateAppAddress)

module.exports = router