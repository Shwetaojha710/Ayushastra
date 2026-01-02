const express = require("express");
// const { userRegiser } = require('../controller/auth/login');
const {
  addCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getcategoryDD,
} = require("../controller/admin/category.js");
const {
  addDiseases,
  getAllDiseases,
  updateDiseases,
  deleteDiseases,
  getDiseasesDD,
  addUnit,
  getAllUnit,
  updateUnit,
  deleteUnit,
  addBrand,
  getAllBrand,
  updateBrand,
  addingredient,
  getAllIngredient,
  updateIngredient,
  addProductType,
  getAllProductType,
  updateProductType,
  addsalt,
  getAllsalt,
  updateSalt,
  deleteSalt,
  addProduct,
  getAllProducts,
  updateProduct,
  getAllUnitDD,
  getAllBrandDD,
  getAllIngredientDD,
  getAllProductTypeDD,
  getAllsaltDD,
  addBanner,
  getBanner,
  updateBanner,
  getAllProductsDD,
  addcoupon,
  getcoupon,
  deletecoupon,
  updatecoupon,
  getcouponDD,
  getstatedd,
  getdistrictdd,
  addDoctor,
  getallDoctorList,
  getallDoctorById,
  addspeclization,
  getAllspeclization,
  getAllspeclizationDD,
  updatespeclization,
  deletespeclization,
  updateDoctor,
  getallDoctordd,
  userDropDown,
  addDoctorSlots,
  getDoctorSlot,
  updateDoctorSlots,
  addOfflineDoctorSlots,
  getAllcitydd,
  addClinic,
  adddepartment,
  getAlldepartment,
  getAlldepartmentDD,
  updatedepartment,
  addtreatment,
  getAlltreatment,
  updatetreatment_master,
  deletetreatment,
  getAlltreatmentDD,
  addDoctorPersonal,
  addDoctorProfessional,
  getProductDD,
  setDoctorAvailability,
  ProductById,
  deleteClinic,
  createPatientFromDoctor,
  listTodayPatientsForDoctor
} = require("../controller/admin/master.js");
const upload = require("../middleware/upload.js");
const { Admin, DoctorAdmin, publicRegisteredAdmin } = require("../middleware/auth.js");
const { addBlog, getAllBlog, updateBlog, deleteBlog, documentUpload } = require("../controller/admin/blog.js");
const { addVideo, updateVideo, listVideos, deleteVideo } = require("../controller/admin/video.js");
const { getDashboardData, dashboardOrderTable, getPopularProducts, getOrderById } = require("../controller/admin/dashboard.js");
const { getOrderList } = require("../controller/admin/checkout.js");
const { addReview, getUser, getRegisteredUser, updateRegisteredUser, updateUserStatus } = require("../controller/admin/account.js");
const { upsertReferralSettings, getReferralSettings, addReferral, updateReferral, deleteReferral } = require("../controller/admin/referral.js");
const { getPartnerList, updateBecomePartner } = require("../controller/admin/partner.js");
const { getBookings, getDoctorCalendarEvents } = require("../controller/admin/booking.js");
const { createDoctorChangeRequest } = require("../controller/admin/doctor.js");
const PrakritiCategory = require("../model/prakriti_category.js");
const { CreatePrakritiCategory, getAllPrakritiCategory, getAllPrakritiCategoryDD, updatePrakritiCategory } = require("../controller/admin/prakriti.js");
const { updatebookingStatus } = require("../controller/consultancy/prescription.js");
// const { login, logout, AIlogin,Applogin, verifyOtp, Applogout } = require('../controller/auth/login');
// const {Admin, AppAdmin} = require('../middleware/auth');
const router = express.Router();
router.post("/create-category", Admin, upload.any(), addCategory);
router.get("/list-category", Admin, getAllCategories);
router.post("/update-category", Admin, upload.any(), updateCategory);
router.post("/delete-category", Admin, deleteCategory);
router.post("/category-dd",  getcategoryDD);
router.post("/doctor-dd",  getallDoctordd);

router.post("/create-disease", Admin, upload.any(), addDiseases);
router.get("/list-diseases", Admin, getAllDiseases);
router.post("/update-diseases", Admin,upload.any(), updateDiseases);
router.post("/delete-diseases", Admin, deleteDiseases);
router.post("/disease-dd", getDiseasesDD);

router.post("/create-unit", Admin, addUnit);
router.get("/list-unit", Admin, getAllUnit);
router.post("/unit-dd", Admin, getAllUnitDD);
router.post("/update-unit", Admin, updateUnit);
router.post("/delete-unit", Admin, deleteUnit);

router.post("/create-brand", Admin, addBrand);
router.get("/list-brand", Admin, getAllBrand);
router.post("/brand-dd", getAllBrandDD);
router.post("/update-brand", Admin, updateBrand);
// router.post('/delete-unit',Admin,deleteUnit)
router.post("/create-ingredient", Admin, upload.any(), addingredient);
router.get("/list-ingredient", Admin, getAllIngredient);
router.post("/ingredients-dd", getAllIngredientDD);
router.post("/update-ingredient", Admin, upload.any(),updateIngredient);
// router.post('/delete-unit',Admin,deleteUnit)

router.post("/create-product-type", Admin, addProductType);
router.get("/list-product-type", Admin, getAllProductType);
router.post("/product-type-dd", getAllProductTypeDD);
router.post("/update-product-type", Admin, updateProductType);
// router.post('/delete-unit',Admin,deleteUnit)
router.post("/create-salt", Admin, addsalt);
router.get("/list-salt", Admin, getAllsalt);
router.get("/salt-dd", Admin, getAllsaltDD);
router.post("/update-salt", Admin, updateSalt);
router.post("/delete-salt", Admin, deleteSalt);

// router.post('/create-product',Admin,upload.array('images'),addProduct)
router.post("/create-product",Admin,upload.fields([{ name: "meta_img", maxCount: 1 },{ name: "product_banner_img", maxCount: 1 },{ name: "product_images", maxCount: 10 },]),addProduct);
router.get("/list-product", Admin, getAllProducts);
router.post("/product-by-id", Admin, ProductById);
router.post("/update-product",Admin,upload.fields([{ name: "meta_img", maxCount: 1 }, { name: "product_banner_img", maxCount: 1 },{ name: "product_images", maxCount: 10 },]),updateProduct);
router.get("/product-dd",Admin,getAllProductsDD)

// router.post('/delete-salt',Admin,deleteSalt)
router.post("/create-banner",Admin,upload.any(),addBanner)
router.get("/list-banner",Admin,getBanner)
router.post("/update-banner",Admin,upload.any(),updateBanner)

router.post("/create-coupon", Admin, addcoupon);
router.get("/list-coupon", Admin, getcoupon);
router.get("/coupon-dd", Admin, getcouponDD);
router.post("/update-coupon", Admin, updatecoupon);
router.post("/delete-coupon", Admin, deletecoupon);

router.post("/state-dd", getstatedd);
router.post("/district-dd", getdistrictdd);
const qualificationFields = Array.from({ length: 10 }, (_, i) => ({
  name: `qualifications[${i}].certificate`,
  maxCount: 1,
}));
router.post("/add-doctor", Admin, upload.fields([
  { name: "profile_img", maxCount: 1 },
  { name: "pan_img", maxCount: 1 },
  { name: "aadhaar_f_img", maxCount: 1 },
  { name: "aadhaar_b_img", maxCount: 1 },
  { name: "cert_img", maxCount: 1 },  ...qualificationFields, 

]),addDoctor);
router.get("/list-doctor", Admin, getallDoctorList);
router.post("/doctor-by-id", Admin, getallDoctorById);
router.post("/create-specialization", Admin, addspeclization);
router.get("/list-specialization", Admin, getAllspeclization);
router.post("/specialization-dd", getAllspeclizationDD);
router.post("/update-specialization", Admin, updatespeclization);
router.post("/delete-specialization", Admin, deletespeclization);

router.post("/update-doctor", Admin, upload.fields([
  { name: "profile_img", maxCount: 1 },
  { name: "pan_img", maxCount: 1 },
  { name: "aadhaar_f_img", maxCount: 1 },
  { name: "aadhaar_b_img", maxCount: 1 },
  { name: "cert_img", maxCount: 1 },  ...qualificationFields, 

]),updateDoctor)

router.post("/add-blog", Admin, upload.any(), addBlog);
router.get("/list-blog", Admin, getAllBlog);
router.post("/update-blog", Admin, upload.any(), updateBlog);
router.post("/delete-blog", Admin, deleteBlog);
router.post("/add-video-article", Admin, upload.any(), addVideo);
router.get("/list-video-article", Admin, listVideos);
router.post("/update-video-article", Admin, upload.any(), updateVideo);
router.post("/delete-video-article", Admin, deleteVideo);

router.get("/dashboard", Admin, getDashboardData);
router.post("/dashboard-order-table", Admin, dashboardOrderTable);
router.post("/dashboard-popular-products", Admin, getPopularProducts);
router.post("/order-details", Admin, getOrderById);
router.post("/user-dd", Admin, userDropDown);
router.post("/file-upload-url",   documentUpload);
router.post("/delete-video-article", Admin, deleteVideo);
router.post("/add-doctor-slot", Admin, addDoctorSlots);

const doctorSlots = Array.from({ length: 10 }, (_, i) => ({
  name: `slots[${i}].image_url_2`,
  maxCount: 1,
}));

router.post("/add-clinic", Admin,  upload.any(), addClinic);

router.post( "/add-offline-doctor-slot", Admin,
  upload.any(),
  addOfflineDoctorSlots
);


// router.post("/add-offline-doctor-slot", Admin,upload.any(), addOfflineDoctorSlots);
router.post("/get-doctor-slot", Admin, getDoctorSlot);
router.post("/update-doctor-slot", Admin, updateDoctorSlots);


router.post("/create-referral", Admin, addReferral);
router.get("/list-referral", Admin, getReferralSettings);
// router.get("/salt-dd", Admin, getAllsaltDD);
router.post("/update-referral", Admin, updateReferral);
router.post("/delete-referral", Admin, deleteReferral);
router.get("/guest-user", Admin, getUser);
router.get("/update-user-status", Admin, updateUserStatus);
router.get("/registered-user", Admin, getRegisteredUser);
router.get("/becomePartner-user", Admin, getPartnerList);
router.post("/update-becomePartner-user", Admin, updateBecomePartner);
router.post("/city-dd", getAllcitydd);
router.post('/get-booking-list',Admin,getBookings)
router.post('/get-booking-calendar-list',DoctorAdmin,getDoctorCalendarEvents)

router.post("/review-doctor",Admin,createDoctorChangeRequest);



// router.post('/delete-unit',Admin,deleteUnit)
router.post("/create-department", Admin, adddepartment);
router.get("/list-department", Admin, getAlldepartment);
router.post("/department-dd", getAlldepartmentDD);
router.post("/update-department", Admin, updatedepartment);


router.post("/create-PrakritiCategory", Admin, CreatePrakritiCategory);
router.get("/list-PrakritiCategory", Admin, getAllPrakritiCategory);
router.post("/PrakritiCategory-dd", getAllPrakritiCategoryDD);
router.post("/update-PrakritiCategory", Admin, updatePrakritiCategory);
// router.post('/delete-unit',Admin,deleteUnit)


router.post("/create-treatment", Admin, addtreatment);
router.get("/list-treatment", Admin, getAlltreatment);
router.get("/treatment-dd", Admin, getAlltreatmentDD);
router.post("/update-treatment", Admin, updatetreatment_master);
router.post("/delete-treatment", Admin, deletetreatment);


router.post("/add-dr-personal",DoctorAdmin,upload.fields([
  { name: "profile_img", maxCount: 1 },
]), addDoctorPersonal);

router.post("/add-dr-professional",DoctorAdmin,upload.fields([
  { name: "council_certificate", maxCount: 1 },
]), addDoctorProfessional);

router.post("/add-dr-slot",DoctorAdmin, setDoctorAvailability);
router.post("/update-reg-user",Admin, updateRegisteredUser);
router.post("/update-booking-status", updatebookingStatus);
router.post('/delete-clinic',DoctorAdmin,deleteClinic)
router.post('/create-patient-record',DoctorAdmin,createPatientFromDoctor)
router.post('/list-doctor-patients',DoctorAdmin,listTodayPatientsForDoctor)
// router.post("/add-dr-slot",DoctorAdmin, setDoctorAvailability);


router.get("/product-dd", getProductDD);

module.exports = router;
