const Product = require("../../../model/product");
const Helper = require("../../helper/helper");
const { Op, where } = require("sequelize");
const registered_user = require("../../../model/registeredusers");
const coupons = require("../../../model/coupon");
const Wishlist = require("../../../model/wishlist");
const Cart = require("../../../model/cart");
exports.addWishlist = async (req, res) => {
  try {
    const { productId, price, quantity, total, status = true } = req.body;

    const deviceId = req?.headers?.deviceid;
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];

    const token = authHeader?.split(" ")[1]; // e.g. "Bearer <token>"

    if (!token) {
      return Helper.response(false, "Login First", [], res, 404);
    }

    const registerUser = token? await registered_user.findOne({
          where: { token },
        }): null;
    if (!registerUser) {
      return Helper.response(false, "No User Found", [], res, 404);
    }

    if (!deviceId || deviceId.trim() === "") {
      return Helper.response(false, "Device ID is required", [], res, 400);
    }

    const CreateWishlist = await Wishlist.create({
      productId,
      price,
      quantity: quantity || 1,
      total: total || price,
      status: status,
      deviceId,
      registeruserId: registerUser ? registerUser.id : null,
    });

    return Helper.response(
      true,
      "Wishlist added successfully",
      CreateWishlist,
      res,
      201
    );
  } catch (error) {
    console.error("AddWishlist Error:", error);
    return Helper.response(
      false,
      error.message,
      "Error adding Wishlist",
      res,
      500
    );
  }
};

exports.getWishlistList = async (req, res) => {
  try {
    const deviceId = req?.headers?.deviceid;
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];
    const token = authHeader?.split(" ")[1];

    const registerUser = token
      ? await registered_user.findOne({ where: { token }, raw: true })
      : null;

    let whereCondition = {};
    if (registerUser) {
      whereCondition.registeruserId = registerUser.id;
    } else if (deviceId) {
      whereCondition.deviceId = deviceId;
    } else {
      return Helper.response(false, "User not identified", {}, res, 401);
    }

    // Fetch wishlist items
    const wishlists = await Wishlist.findAll({
      where: whereCondition,
      order: [["id", "DESC"]],
      raw: true,
    });

    if (!wishlists || wishlists.length === 0) {
      return Helper.response(false, "No wishlist items found", [], res, 404);
    }

    const productIds = wishlists.map((item) => item.productId);

    const products = await Product.findAll({
      where: { id: productIds, status: true },
      raw: true,
    });

    // Merge wishlist with corresponding product info
    const items = wishlists.map((item) => {
      const product = products.find((p) => p.id == item.productId);
      return {
        id: item.id,
        image: product?.product_banner_image || null,
        title: product?.product_name || "N/A",
        rating: product?.rating || 0,
        mrp: product?.mrp ? product.mrp : 0,
        offer_price: product?.offer_price ? product.offer_price : 0,
      };
    });

    return Helper.response(
      true,
      "Wishlist fetched successfully",
      items,
      res,
      200
    );
  } catch (error) {
    console.error("Wishlist error:", error);
    return Helper.response(
      false,
      "Error fetching wishlist",
      { message: error.message },
      res,
      500
    );
  }
};

exports.moveToCart = async (req, res) => {
  try {
    const {id, productId, price, quantity, total, status =true} = req.body;
    const deviceId = req?.headers?.deviceid;
    const token = req.headers["authorization"]?.split(" ")[1];
     
    if(!id){
        return Helper.response(false,"Id is required!",[],res,400)
    }
    if (!deviceId) {
      return Helper.response(false, "Device ID is required", [], res, 400);
    }

    // if (!productId || !price) {
    //   return Helper.response(false, "Product ID and Price are required", [], res, 400);
    // }

    const registerUser = token ? await registered_user.findOne({ where: { token } }) : null;

  

    const wishlistItem = await Wishlist.findOne({ where: {id} });

    if (!wishlistItem) {
      return Helper.response(false, "Wishlist item not found", {}, res, 404);
    }

   
    const cart = await Cart.create({
      productId:wishlistItem?.productId,
      price,
      quantity: quantity || 1,
      total: total ||0,
      status: status,
      deviceId,
      registeruserId: registerUser ? registerUser.id : null,
    });

    await wishlistItem.destroy();

    return Helper.response(
      true,
      "Wishlist item moved to cart successfully",
      { cart },
      res,
      200
    );
  } catch (error) {
    console.error("moveToCart error:", error);
    return Helper.response(false, "Error moving item to cart", { message: error.message }, res, 500);
  }
};

exports.deleteWishlist = async (req, res) => {
  try {
    const { id } = req.body;
    if (id === undefined || id === "") {
      return Helper.response(false, "Wishlist ID is required", {}, res, 400);
    }
    if (id == "clear_all") {
      const deviceId = req?.headers?.deviceid;
      if (!deviceId || deviceId == undefined || deviceId == "") {
        return Helper.response(false, "Device ID is required", [], res, 400);
      }
      await Wishlist.destroy({ where: { deviceId: deviceId } });
      return Helper.response(
        true,
        "All Wishlist items cleared successfully",
        {},
        res,
        200
      );
    }
    const Wishlists = await Wishlist.findByPk(id);
    if (!Wishlists) {
      return Helper.response(false, "Wishlist not found", {}, res, 404);
    }
    await Wishlists.destroy();
    return Helper.response(true, "Wishlist deleted successfully", {}, res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error deleting Wishlist",
      res,
      500
    );
  }
};

