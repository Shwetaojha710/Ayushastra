const express = require('express');
const { userRegister, login } = require('../controller/auth/login');
const { UserRegistration, Userlogin } = require('../controller/admin/account');
const { AppsendOtp, AppverifyOtp } = require('../controller/admin/app');
const { getCity, getDoctorByFilter, getDoctorInfo , getDoctorConsultationSlots, createConsultationBooking,getDoctorProfile} = require('../controller/consultancy/doctors');
const upload = require("../middleware/upload.js");
const { publicRegisteredAdmin, DoctorAdmin } = require('../middleware/auth.js');
const { createMultipleClinicsWithSlots } = require('../controller/admin/doctor.js');
// const { login, logout, AIlogin,Applogin, verifyOtp, Applogout } = require('../controller/auth/login');
// const {Admin, AppAdmin} = require('../middleware/auth');
const router = express.Router();

router.post('/registration',userRegister)
router.post('/login',login)
router.post('/register',UserRegistration)
router.post('/user-login',Userlogin)
router.post('/app-send-otp',AppsendOtp)
router.post('/app-verify-otp',AppverifyOtp)



//consultancy page routes
router.post('/get-city',getCity);
router.post('/get-doctors',getDoctorByFilter)
router.post('/get-doctor-info',DoctorAdmin,getDoctorInfo)
router.post('/get-doctor-slots',getDoctorConsultationSlots)
router.post('/get-doctor-profile',getDoctorProfile)
// router.post('/book-doctor-slot',publicRegisteredAdmin,upload.fields([{ name: "prescription_img", maxCount: 10 }]),createConsultationBooking)
router.post('/book-doctor-slot',publicRegisteredAdmin,upload.any(),createConsultationBooking)
router.post('/create-multiple-clinic',DoctorAdmin,createMultipleClinicsWithSlots)
// 
// router.post('/book-doctor-slot',upload.any(),createConsultationBooking)

//Question and Answers Routes
module.exports = router