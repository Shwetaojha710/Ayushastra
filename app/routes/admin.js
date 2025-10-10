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
} = require("../controller/admin/master.js");
const upload = require("../middleware/upload.js");
const { Admin } = require("../middleware/auth.js");
// const { login, logout, AIlogin,Applogin, verifyOtp, Applogout } = require('../controller/auth/login');
// const {Admin, AppAdmin} = require('../middleware/auth');
const router = express.Router();
router.post("/create-category", Admin, upload.any(), addCategory);
router.get("/list-category", Admin, getAllCategories);
router.post("/update-category", Admin, upload.any(), updateCategory);
router.post("/delete-category", Admin, deleteCategory);
router.post("/category-dd", Admin, getcategoryDD);

router.post("/create-disease", Admin, upload.any(), addDiseases);
router.get("/list-diseases", Admin, getAllDiseases);
router.post("/update-diseases", Admin, updateDiseases);
router.post("/delete-diseases", Admin, deleteDiseases);
router.post("/disease-dd", Admin, getDiseasesDD);

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
router.post("/create-ingredient", Admin, addingredient);
router.get("/list-ingredient", Admin, getAllIngredient);
router.post("/ingredients-dd", getAllIngredientDD);
router.post("/update-ingredient", Admin, updateIngredient);
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


module.exports = router;
