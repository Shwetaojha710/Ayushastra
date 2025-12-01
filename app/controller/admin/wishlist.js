const Product = require("../../model/product");
const Helper = require("../../helper/helper");
const { Op, where } = require("sequelize");
const registered_user = require("../../model/registeredusers");
const coupons = require("../../model/coupon");
const Wishlist = require("../../model/wishlist");
const Cart = require("../../model/cart");
const wishlist = require("../../model/wishlist");

exports.addWishlist = async (req, res) => {
  try {
    const { productId, price, quantity, total, status = true } = req.body;

    const deviceId = req?.headers?.deviceid;
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];

    const token = authHeader?.split(" ")[1]; // e.g. "Bearer <token>"

    if (!token || token=='null') {
      return Helper.response(false, "Login First", [], res, 404);
    }

    const registerUser = token? await registered_user.findOne({
          where: { token, isDeleted:false },
        }): null;
    if (!registerUser) {
      return Helper.response(false, "No User Found", [], res, 404);
    }

    if (!deviceId || deviceId.trim() === "") {
      return Helper.response(false, "Device ID is required", [], res, 400);
    }

    const existsProductWish=await wishlist.findOne({
        where:{
            productId,
            registeruserId: registerUser?.id
        }
    })

    if(existsProductWish){
      return Helper.response(false,"Product Already Exists",[],res,400)
    } 

    const data=await Product.findOne({
        where:{
            id:productId
        }
    })



    const CreateWishlist = await Wishlist.create({
      productId,
      price,
      quantity: quantity || 1,
      total: total || data?.offer_price,
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
      ? await registered_user.findOne({ where: { token, isDeleted:false }, raw: true })
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

    if (!wishlists || wishlists.length == 0) {
      return Helper.response(false, "No wishlist items found", [], res, 200);
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
        quantity: item?.quantity,
        image: product?.meta_image || null,
        title: product?.product_name || "N/A",
        rating: product?.rating || 0,
        mrp: product?.mrp ? product.mrp : 0,
        offer_price: product?.offer_price ? product.offer_price : 0,
        slug: product?.slug ? product.slug : 0,
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
    const { id, quantity = 1, status = true } = req.body;

    const deviceId = req.headers?.deviceid;
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!id) {
      return Helper.response(false, "Id is required!", [], res, 400);
    }

    if (!deviceId) {
      return Helper.response(false, "Device Id is required", [], res, 400);
    }

    // Get logged-in user
    const registerUser = token
      ? await registered_user.findOne({
          where: { token, isDeleted: false },
        })
      : null;

    // Fetch wishlist item
    const wishlistItem = await Wishlist.findOne({ where: { id } });

    if (!wishlistItem) {
      return Helper.response(false, "Wishlist item not found", {}, res, 404);
    }

    // Fetch product to check max quantity
    const product = await Product.findOne({
      where: { id: wishlistItem.productId },
      raw: true,
    });

    if (!product) {
      return Helper.response(false, "Product not found", {}, res, 404);
    }

    // MAX QUANTITY VALIDATION
    const maxQty = product.maximum_qty || 4; // default 4 if not set

    // Check if product exists in cart
    const existingCart = await Cart.findOne({
      where: {
        productId: wishlistItem.productId,
        registeruserId: registerUser ? registerUser.id : null,
      },
    });

    // CASE 1 → Product already in cart → Updating quantity
    if (existingCart) {
      const newQty = Number(existingCart.quantity) + Number(quantity);

      if (newQty > maxQty) {
        return Helper.response(
          false,
          `You can only add maximum ${maxQty} quantity of this product`,
          {},
          res,
          400
        );
      }

      await existingCart.update({
        quantity: newQty,
        total: Number(wishlistItem.price) * newQty,
      });

      await wishlistItem.destroy();

      return Helper.response(
        true,
        "Quantity updated & moved from wishlist to cart",
        existingCart,
        res,
        200
      );
    }

    // CASE 2 → Creating new cart entry
    if (quantity > maxQty) {
      return Helper.response(
        false,
        `Maximum allowed quantity is ${maxQty}`,
        {},
        res,
        400
      );
    }

    const newCart = await Cart.create({
      productId: wishlistItem.productId,
      price: wishlistItem.price,
      quantity: quantity,
      total: wishlistItem.price * quantity,
      status: status,
      registeruserId: registerUser ? registerUser.id : null,
      deviceId: registerUser ? null : deviceId,
    });

    await wishlistItem.destroy();

    return Helper.response(
      true,
      "Wishlist item moved to cart successfully",
      newCart,
      res,
      200
    );
  } catch (error) {
    console.error("moveToCart error:", error);
    return Helper.response(
      false,
      "Error moving item to cart",
      { message: error.message },
      res,
      500
    );
  }
};

// commented previous code for moveToCart function at 28_11_2025
// exports.moveToCart = async (req, res) => {
//   try {
//     const { id, quantity = 1, status = true } = req.body;

//     const deviceId = req.headers?.deviceid;
//     const token = req.headers["authorization"]?.split(" ")[1];

//     if (!id) {
//       return Helper.response(false, "Id is required!", [], res, 400);
//     }

//     if (!deviceId) {
//       return Helper.response(false, "Device Id is required", [], res, 400);
//     }

//     // Find logged-in user
//     const registerUser = token
//       ? await registered_user.findOne({
//           where: { token, isDeleted: false },
//         })
//       : null;
 
 
//     // Get wishlist item
//     const wishlistItem = await Wishlist.findOne({ where: { id } });

//     if (!wishlistItem) {
//       return Helper.response(false, "Wishlist item not found", {}, res, 404);
//     }
   
//     // Check if product already exists in cart
//     const existingCart = await Cart.findOne({
//       where: {
//         productId: wishlistItem.productId,
//         registeruserId: registerUser ? registerUser.id : null,
//       },
//     });

//     // CASE 1: Product already exists → UPDATE quantity
//     if (existingCart) {
//       const newQty = Number(existingCart.quantity) + Number(quantity);
//       const newTotal = Number(wishlistItem.price) * newQty;

//       await existingCart.update({
//         quantity: newQty,
//         total: newTotal,
//       });

//       await wishlistItem.destroy();

//       return Helper.response(
//         true,
//         "Quantity updated & moved from wishlist to cart",
//         existingCart,
//         res,
//         200
//       );
//     }

//     // CASE 2: Product not found in cart → CREATE new cart entry
//     const newCart = await Cart.create({
//       productId: wishlistItem.productId,
//       price: wishlistItem.price,
//       quantity: quantity,
//       total: wishlistItem.price * quantity,
//       status: status,
//       registeruserId: registerUser ? registerUser.id : null,
//       deviceId: registerUser ? null : deviceId,
//     });

//     await wishlistItem.destroy();

//     return Helper.response(
//       true,
//       "Wishlist item moved to cart successfully",
//       newCart,
//       res,
//       200
//     );
//   } catch (error) {
//     console.error("moveToCart error:", error);
//     return Helper.response(
//       false,
//       "Error moving item to cart",
//       { message: error.message },
//       res,
//       500
//     );
//   }
// };


// exports.moveToCart = async (req, res) => {
//   try {
//     const {id, productId, price, quantity, total, status =true} = req.body;
//     const deviceId = req?.headers?.deviceid;
//     const token = req.headers["authorization"]?.split(" ")[1];
     
//     if(!id){
//         return Helper.response(false,"Id is required!",[],res,400)
//     }
//     if (!deviceId) {
//       return Helper.response(false, "Device Id is required", [], res, 400);
//     }

//     // if (!productId || !price) {
//     //   return Helper.response(false, "Product ID and Price are required", [], res, 400);
//     // }

//     const registerUser = token ? await registered_user.findOne({ where: { token , isDeleted:false} }) : null;

  

//     const wishlistItem = await Wishlist.findOne({ where: {id} });

//     if (!wishlistItem) {
//       return Helper.response(false, "Wishlist item not found", {}, res, 404);
//     }
    
//     const checkProduct=await Cart.findOne({
//       where:{
//          productId:wishlistItem?.productId,
//        registeruserId: registerUser ? registerUser.id : null,
//       }
//     })
//     if(checkProduct){
//       await Cart.update({

//       })
//     }
   
//     const cart = await Cart.create({
//       productId:wishlistItem?.productId,
//       price:wishlistItem?.price|| price,
//       quantity: quantity || 1,
//       total:wishlistItem?.total|| total ,
//       status: status,
//       registeruserId: registerUser ? registerUser.id : null,
//     });

//     await wishlistItem.destroy();

//     return Helper.response(
//       true,
//       "Wishlist item moved to cart successfully",
//       { cart },
//       res,
//       200
//     );
//   } catch (error) {
//     console.error("moveToCart error:", error);
//     return Helper.response(false, "Error moving item to cart", { message: error.message }, res, 500);
//   }
// };

exports.deleteWishlist = async (req, res) => {
  try {
    const { id, productId } = req.body;

   
    if (!id && !productId) {
      return Helper.response(false, "ID is required", {}, res, 400);
    }

  
    if (id === "clear_all") {
      const deviceId = req?.headers?.deviceid;
      if (!deviceId) {
        return Helper.response(false, "Device ID is required", [], res, 400);
      }

      await Wishlist.destroy({ where: { deviceId } });

      return Helper.response(
        true,
        "All Wishlist items cleared successfully",
        {},
        res,
        200
      );
    }

   
    let whereCondition = {};

    if (productId) {
      whereCondition.productId = productId;
      whereCondition.registeruserId = req?.users?.id; // ensure user is authenticated
    }

    if (id && id !== "clear_all") {
      whereCondition.id = id;
    }


    const wishlistItem = await Wishlist.findOne({ where: whereCondition });

    if (!wishlistItem) {
      return Helper.response(false, "Wishlist item not found", {}, res, 404);
    }

  
    await wishlistItem.destroy();

    return Helper.response(true, "Wishlist item deleted successfully", {}, res, 200);

  } catch (error) {
    console.error("Error deleting wishlist:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

