const express = require('express');

const { AppsendOtp, AppverifyOtp, UserProfile,UpdateUserProfile, checkToken, Verifycredential, SendOtpcredential, verifyOtpcredential, getappProduct, AppaddCart, getAllMasterDD, getSubCategory, getCheckOutCartList, getAppCartList, addAppAddress, getAppAddressList, updateAppAddress, addPaymentMethod, paymentMethodsList, AppcheckOut, updateAppAddressDetails, getAppOrderDetails, UserDetails } = require('../controller/admin/app');
const {  publicRegisteredAdmin, Admin, DoctorAdmin } = require('../middleware/auth');
const { CreatePrakiritQues, CreatePrakritiOption, CreatePrakritiCategory, getPrakritiQuestion, getPrakritiQuestionList, savePrakritiRecommendationBulk, getPrakritiRecommendationByType, updatePrakritiQues } = require('../controller/admin/prakriti');
const { addPrescription, medicineDD, prescriptionList, getPrescriptionDetails, addAllUserPrescription } = require('../controller/consultancy/prescription');
const { UploadDoctordoc } = require('../controller/admin/category');
const upload = require('../middleware/upload');
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
router.post("/app-update-address-details",publicRegisteredAdmin,updateAppAddressDetails)
router.post("/app-payment-method",addPaymentMethod)
router.get("/list-payment-method",publicRegisteredAdmin,paymentMethodsList)
router.post("/app-checkout",publicRegisteredAdmin,AppcheckOut)
router.post("/app-order-details",publicRegisteredAdmin,getAppOrderDetails)
router.get("/list-payment-method",publicRegisteredAdmin,paymentMethodsList)
router.post("/create-prakriti-ques",CreatePrakiritQues)
router.get("/list-prakrity-questions",getPrakritiQuestionList)
router.post("/update-prakrity-questions",updatePrakritiQues)
router.post("/create-prakriti-option",CreatePrakritiOption)
router.post("/create-prakriti-cat",CreatePrakritiCategory)
router.get("/prakriti-question",getPrakritiQuestion)
router.post("/create-prakriti-recommendation",Admin,savePrakritiRecommendationBulk)
router.get("/list-prakriti-recommendation",Admin,getPrakritiRecommendationByType)
router.post("/add-prescription",DoctorAdmin,addPrescription)
router.post("/add-all-user-prescription",DoctorAdmin,addAllUserPrescription)
router.post("/list-prescription",DoctorAdmin,prescriptionList)
router.post("/prescription-details",getPrescriptionDetails)
router.post("/medicine-dd",medicineDD)
router.post("/upload-doctor-doc",upload.any(),UploadDoctordoc)
router.post("/user-details",UserDetails)

module.exports = router