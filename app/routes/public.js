const express = require("express");
const { getPublicBanner, getPublicproduct, getPublicDoctor, getPublicDiseases, PubliclistVideos, PublicBlog,getProductById } = require("../controller/admin/public");
const { checkOut, sendOtp, verifyOtp, getOrderList, CouponList } = require("../controller/admin/checkout");
const { addCart, getCartList, updateCart, deleteCart } = require("../controller/admin/cart");
const { publicAdmin, publicRegisteredAdmin } = require("../middleware/auth");
const { myOrders, Userlogout, viewAddressDetails } = require("../controller/admin/account");
const { addWishlist, getWishlistList, updateWishlist, deleteWishlist, moveToCart } = require("../controller/admin/wishlist");
const router = express.Router();


router.get("/public-banner",getPublicBanner)
router.post("/public-product",getPublicproduct)
router.get("/public-doctor",getPublicDoctor)
router.get("/public-diseases",getPublicDiseases)
router.get("/public-videos",PubliclistVideos)
router.get("/public-blog",PublicBlog)
router.post("/check-out",checkOut)
router.post("/add-cart",addCart)
router.post("/list-cart",getCartList)
router.post("/update-cart",updateCart)
router.post("/delete-cart",deleteCart)
router.post("/get-product-by-id",getProductById)
router.post("/send-otp",sendOtp)
router.post("/verify-otp",verifyOtp)
router.get("/list-checkout",publicAdmin,getOrderList)
router.get("/register",publicAdmin,getOrderList)
router.post("/my-orders",publicRegisteredAdmin,myOrders)
router.post("/user-logout",publicRegisteredAdmin,Userlogout)
router.post("/my-orders-detail-by-id",publicRegisteredAdmin,viewAddressDetails)
router.get("/coupon-list",CouponList)

router.post("/add-wishlist",addWishlist)
router.post("/list-wishlist",getWishlistList)
router.post("/move-to-cart",moveToCart)
router.post("/delete-wishlist",deleteWishlist)

module.exports = router;
