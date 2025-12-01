const express = require("express");
const { getPublicBanner, getPublicproduct, getPublicDoctor, getPublicDiseases, PubliclistVideos, PublicBlog,getProductById, addPublicDoctor, referralDetails, getStateDistrict } = require("../controller/admin/public");
const { checkOut, sendOtp, verifyOtp, getOrderList, CouponList } = require("../controller/admin/checkout");
const { addCart, getCartList, updateCart, deleteCart, getCheckOutCartList } = require("../controller/admin/cart");
const { publicAdmin, publicRegisteredAdmin } = require("../middleware/auth");
const { myOrders, Userlogout, viewAddressDetails, UpdateProfile, deleteAccount, UserAddressDetails, updateAddress, addAddress, addReview, getReview, deleteAddress } = require("../controller/admin/account");
const { addWishlist, getWishlistList, updateWishlist, deleteWishlist, moveToCart } = require("../controller/admin/wishlist");
const router = express.Router();
const upload = require("../middleware/upload.js");
const { submitImmunityQuiz, getImmunityResults, getImminityAnswer } = require("../controller/admin/immunity.js");
const { submitprakritiQuiz, getPrakritiAnswer, getPrakritiResults } = require("../controller/admin/prakriti.js");
const { getReferralStats, calculateReferralIncentive, getReferralList } = require("../controller/admin/referral.js");
const { createPartner } = require("../controller/admin/partner.js");
const { addFamilyMember, getFamilyMemberList, updateFamilyMember, deleteFamilyMember } = require("../controller/admin/doctor.js");

router.get("/public-banner",getPublicBanner)
router.post("/public-product",getPublicproduct)
router.get("/public-doctor",getPublicDoctor)
router.get("/public-diseases",getPublicDiseases)
router.get("/public-videos",PubliclistVideos)
router.get("/public-blog",PublicBlog)
router.post("/check-out",checkOut)
router.post("/add-cart",addCart)
router.post("/list-cart",getCartList)
router.post("/check-out-cart-list",getCheckOutCartList)
router.post("/update-cart",updateCart)
router.post("/delete-cart",deleteCart)
router.post("/get-product-by-id",getProductById)
router.post("/send-otp",sendOtp)
router.post("/verify-otp",verifyOtp)
router.get("/list-checkout",publicAdmin,getOrderList)
router.post("/my-orders",publicRegisteredAdmin,myOrders)
router.post("/user-logout",publicRegisteredAdmin,Userlogout)
router.post("/my-orders-detail-by-id",publicRegisteredAdmin,viewAddressDetails)
router.post("/user-addresses",publicRegisteredAdmin,UserAddressDetails)
router.get("/coupon-list",CouponList)

router.post("/add-wishlist",publicRegisteredAdmin,addWishlist)
router.post("/list-wishlist",publicRegisteredAdmin,getWishlistList)
router.post("/move-to-cart",publicRegisteredAdmin,moveToCart)
router.post("/delete-wishlist",publicRegisteredAdmin,deleteWishlist)

router.post("/update-profile",publicRegisteredAdmin,upload.any(),UpdateProfile)
router.post("/delete-account",publicRegisteredAdmin,deleteAccount)

router.post("/update-address",publicRegisteredAdmin,updateAddress)
router.post("/add-address",publicRegisteredAdmin,addAddress)
router.post("/remove-address",publicRegisteredAdmin,deleteAddress)
router.post("/submit-immunity",submitImmunityQuiz)
router.post("/get-immunity-result-by-id",getImminityAnswer)
router.post("/get-immunity-results",getImmunityResults)
router.post("/submit-prakrity",submitprakritiQuiz)
router.post("/get-prakrity-result-by-id",getPrakritiAnswer)
router.post("/get-prakrity-results",getPrakritiResults)
router.post("/my-review-submit",publicRegisteredAdmin,upload.any(),addReview)
router.post("/user-dashboard",publicRegisteredAdmin,getReferralStats)
router.post("/dashboard-list",publicRegisteredAdmin,getReferralList)
router.post("/become-partner",publicRegisteredAdmin,calculateReferralIncentive)
router.post("/list-review",getReview)
router.post("/create-partner",createPartner)
router.post("/referral-details",referralDetails)
const qualificationFields = Array.from({ length: 10 }, (_, i) => ({
  name: `qualifications[${i}].certificate`,
  maxCount: 1,
}));
router.post("/add-public-doctor", upload.fields([
  { name: "profile_img", maxCount: 1 },
  { name: "pan_img", maxCount: 1 },
  { name: "aadhaar_f_img", maxCount: 1 },
  { name: "aadhaar_b_img", maxCount: 1 },
  { name: "cert_img", maxCount: 1 },  ...qualificationFields, 

]),addPublicDoctor);


router.post("/get-state-district",getStateDistrict)
router.post("/add-member",addFamilyMember)
router.post("/get-member-list",getFamilyMemberList)
router.post("/update-member",updateFamilyMember)
router.post("/delete-member",deleteFamilyMember)

module.exports = router;
