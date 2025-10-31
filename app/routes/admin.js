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
} = require("../controller/admin/master.js");
const upload = require("../middleware/upload.js");
const { Admin } = require("../middleware/auth.js");
const { addBlog, getAllBlog, updateBlog, deleteBlog } = require("../controller/admin/blog.js");
const { addVideo, updateVideo, listVideos, deleteVideo } = require("../controller/admin/video.js");
const { getDashboardData, dashboardOrderTable, getPopularProducts } = require("../controller/admin/dashboard.js");
const { getOrderList } = require("../controller/admin/checkout.js");
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

router.post("/state-dd", Admin, getstatedd);
router.post("/district-dd", Admin, getdistrictdd);
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
router.post("/specialization-dd", Admin, getAllspeclizationDD);
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

module.exports = router;
