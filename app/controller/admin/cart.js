const Cart = require("../../model/cart");
const Product = require("../../model/product");
const Coupon = require("../../model/coupon");
const Helper = require("../../helper/helper");
const { Op, where } = require("sequelize");
const registered_user = require("../../model/registeredusers");
const coupons = require("../../model/coupon");
const Brand = require("../../model/brand");
const User = require("../../model/user");
// exports.addCart = async (req, res) => {
//   try {
//     const { productId, price, quantity, total, status = true } = req.body;

//     const deviceId = req?.headers?.deviceid;
//     const authHeader =
//       req.headers["authorization"] || req.headers["Authorization"];

//     const token = authHeader?.split(" ")[1]; // e.g. "Bearer <token>"

//     const registerUser = token
//       ? await registered_user.findOne({
//           where: { token },
//         })
//       : null;

//     if (!deviceId || deviceId.trim() === "") {
//       return Helper.response(false, "Device ID is required", [], res, 400);
//     }

//     if (!productId) {
//       return Helper.response(false, "Product ID is required", [], res, 400);
//     }

//     const whereCondition = { productId  };
//     if (registerUser) whereCondition.registeruserId = registerUser.id;
//     if(token =='null' || !token){
//         whereCondition.deviceId=deviceId
//     }
//     const existingCart = await Cart.findOne({ where: whereCondition });

//     if (existingCart) {
//       const newQuantity = Number(existingCart.quantity) + (quantity || 1);
//       const newTotal = Number(price) * Number(newQuantity);

//       await existingCart.update({ quantity: newQuantity, total: newTotal });
//       return Helper.response(
//         true,
//         "Cart updated successfully",
//         existingCart,
//         res,
//         200
//       );
//     }

//     const cart = await Cart.create({
//       productId,
//       price,
//       quantity: quantity || 1,
//       total: total || price,
//       status: status,
//       deviceId: token != "null" ? null : deviceId,
//       registeruserId: registerUser ? registerUser.id : null,
//     });

//     return Helper.response(true, "Cart added successfully", cart, res, 201);
//   } catch (error) {
//     console.error("AddCart Error:", error);
//     return Helper.response(false, error.message, "Error adding cart", res, 500);
//   }
// };

// exports.getCartList = async (req, res) => {
//   try {
//     const deviceId = req?.headers?.deviceid;
//     const authHeader = req.headers["authorization"] || req.headers["Authorization"];

//     const token = authHeader?.split(" ")[1];
//     const { ayu_cash_apply = true } = req.body;
//     const registerUserId = token ? await registered_user.findOne({
//           where: {
//             token,
//           },
//         }): null;

//     if (!deviceId) {
//       return Helper.response(false, "Device Id is required", [], res, 400);
//     }
//     let whereCondition = {};
//     if (registerUserId) {
//       await Cart.update({
//          registeruserId:registerUserId.id,
//         deviceId:null
//       },{
//         where:{
//           deviceId
//         },
//       })
//       whereCondition.registeruserId = registerUserId.id;
//     } else {
//       whereCondition.deviceId = deviceId;
//     }

//     const carts = await Cart.findAll({
//       where: whereCondition,
//       order: [["id", "DESC"]],
//       raw: true,
//     });

//     if (!carts || carts.length == 0) {
//       return Helper.response(false, "No carts found", [], res, 200);
//     }

//     let finalData = await Promise.all(
//       carts.map(async (item) => {
//         const productData = await Product.findAll({
//           where: {
//             id: item.productId,
//             status: true,
//             isPublish: true,
//           },
//           order: [["id", "ASC"]],
//           raw: true,
//         });
//         if (!productData || productData.length == 0) return null;

//         return {
//           ...item,
//           quantity: parseFloat(item.quantity),
//           total: parseFloat(item.total),
//           price: parseFloat(item.price),
//           productData,
//         };
//       })
//     );
//     finalData = finalData.filter((item) => item != null);
//     let subtotalAmount = finalData.reduce((acc, item) => acc + item.total, 0);
//     let totalAmount = finalData.reduce((acc, item) => acc + item.total, 0);
//     let couponData;

//     if (req.body.coupon_id) {
//       couponData = await coupons.findOne({
//         where: {
//           id: req.body?.coupon_id,
//         },
//       });

//       totalAmount = subtotalAmount - couponData?.max_discount;
//       if (totalAmount < 0) {
//         totalAmount = totalAmount + couponData?.max_discount;
//         if (couponData) {
//           couponData.max_discount = "Not Applicable";
//         }
//         // return Helper.response(false,"Not Applicable For this Prodcut", [],res,200)
//       }

//       // if(totalAmount<couponData?.min_amount){
//       //     Helper.response(false,"Not Applicable For this Prodcut", [],res,200)
//       // }
//       // else if(totalAmount>couponData?.max_discount){
//       //     Helper.response(false,"Not Applicable For this Prodcut", [],res,200)
//       // }
//       // else{

//       // }
//     }

//     if (finalData.length == 0) {
//       return Helper.response(false, "No Data Found", [], res, 200);
//     }

//     const ayuCash = finalData.reduce((acc, item) => {
//       const product = item.productData.find(
//         (product) => product.id == item.productId
//       );
//       return acc + (parseInt(product?.ayu_cash) || 0);
//     }, 0);

//     let ayushastraBrandValue = 0;

//     for (const item of finalData) {
//       const product = item.productData.find(
//         (p) => p.id === item.productId && p.status === true
//       );
//       const brand = await Brand.findOne({
//         where: {
//           id: product?.brand_id,
//         },
//       });
//       if (brand?.name?.toLowerCase() == "ayushsatra") {
//         ayushastraBrandValue += parseFloat(item.total) || 0;
//       }
//     }

//     const cartValue = subtotalAmount;
//     let maxRedeemableAyuCash = 0;
//     let ayuCashMessage = "";
//     // console.log(token,"token:::");

//     if (token!='null' || !token) {
//       if (cartValue >= 500 && ayushastraBrandValue >= 200) {
//         maxRedeemableAyuCash = (cartValue * 0.2).toFixed(2);
//         totalAmount = ayu_cash_apply
//           ? totalAmount - maxRedeemableAyuCash
//           : totalAmount;
//         ayuCashMessage = `You can redeem up to ₹${maxRedeemableAyuCash} AyuCash.`;
//       } else {
//         if (cartValue < 500) {
//           ayuCashMessage =
//             "Cart value must be at least ₹500 to redeem AyuCash.";
//         } else if (ayushastraBrandValue < 200) {
//           ayuCashMessage =
//             "You must have at least ₹200 of Ayushastra products to redeem AyuCash.";
//         }
//       }
//     }

//     const responseData = {
//       cart_items: finalData,
//       order_summary: {
//         sub_total: subtotalAmount || 0,
//         ayu_cash: ayuCash || 0,
//         shipping_charge: totalAmount > 500 ? 0 : 79,
//         coupon_discount: couponData?.max_discount ?? 0,
//         total_amount: totalAmount > 500 ? totalAmount : totalAmount + 79,
//         coupon_id: req.body.coupon_id ? req.body.coupon_id : null,
//         maxRedeemableAyuCash: maxRedeemableAyuCash,
//         ayuCashMessage: ayuCashMessage,
//         ayu_cash_apply: token ? ayu_cash_apply : null,
//       },
//     };

//     return Helper.response(
//       true,
//       "Cart list fetched successfully",
//       responseData,
//       res,
//       200
//     );
//   } catch (error) {
//     return Helper.response(
//       false,
//       "Error fetching cart list",
//       { message: error.message },
//       res,
//       500
//     );
//   }
// };

exports.addCart = async (req, res) => {
  try {
    const { productId, price, quantity = 1, status = true } = req.body;
    const deviceId = req.headers.deviceid;

    if (!deviceId) {
      return Helper.response(false, "Device ID required", [], res, 400);
    }

    const token = (req.headers.authorization || "").split(" ")[1];
    const registerUser =
      token && token !== "null"
        ? await registered_user.findOne({ where: { token } })
        : null;

    let where = { productId };

    if (registerUser) {
      where.registeruserId = registerUser.id;
    } else {
      where.deviceId = deviceId;
    }

    const existing = await Cart.findOne({ where });

    if (existing) {
      const newQty = Number(existing.quantity) + Number(quantity);
      const newTotal = Number(price) * newQty;

      await existing.update({ quantity: newQty, total: newTotal });

      return Helper.response(true, "Cart updated", existing, res, 200);
    }

    const cart = await Cart.create({
      productId,
      price,
      quantity,
      total: Number(price) * Number(quantity),
      status,
      deviceId: registerUser ? null : deviceId,
      registeruserId: registerUser ? registerUser.id : null,
    });

    return Helper.response(true, "Cart added", cart, res, 201);
  } catch (err) {
    console.error(err);
    return Helper.response(false, "Error adding cart", err, res, 500);
  }
};

// ==========================
// Final getCartList API
// ==========================
// exports.getCartList = async (req, res) => {
//   try {
//     const deviceId = req.headers.deviceid;
//     const { ayu_cash_apply = true } = req.body;

//     if (!deviceId) {
//       return Helper.response(false, "Device Id is required", [], res, 400);
//     }

//     const token = (req.headers.authorization || "").split(" ")[1];
//     const registerUser =
//       token && token !== "null"
//         ? await registered_user.findOne({ where: { token } })
//         : null;

//     // =====================================
//     //  Merge guest → user cart on login
//     // =====================================
//     if (registerUser) {
//       await Helper.mergeGuestCartToUser(deviceId, registerUser.id);
//     }

//     // Build WHERE condition
//     let whereCondition = {};

//     if (registerUser) {
//       whereCondition.registeruserId = registerUser.id;
//     } else {
//       whereCondition.deviceId = deviceId;
//     }

//     // Fetch cart rows
//     const carts = await Cart.findAll({
//       where: whereCondition,
//       order: [["id", "DESC"]],
//       raw: true,
//     });

//     if (!carts.length) {
//       return Helper.response(false, "No carts found", [], res, 200);
//     }

//     // =========================================================
//     //  MAP CART DATA + FETCH PRODUCT
//     // =========================================================
//     let finalData = await Promise.all(
//       carts.map(async (item) => {
//         const productData = await Product.findAll({
//           where: { id: item.productId, status: true, isPublish: true },
//           raw: true,
//         });

//         if (!productData.length) return null;

//         return {
//           ...item,
//           quantity: parseFloat(item.quantity),
//           total: parseFloat(item.total),
//           price: parseFloat(item.price),
//           productData,
//         };
//       })
//     );

//     finalData = finalData.filter((item) => item != null);

//     // =====================================
//     // Subtotal
//     // =====================================
//     let subtotalAmount = finalData.reduce((acc, item) => acc + item.total, 0);
//     let totalAmount = subtotalAmount;

//     let couponData;

//     // ===========================================
//     // Apply Coupon (your logic maintained)
//     // ===========================================
//     if (req.body.coupon_id) {
//       couponData = await coupons.findOne({
//         where: { id: req.body.coupon_id },
//       });

//       if (couponData) {
//         totalAmount = subtotalAmount - couponData.max_discount;

//         if (totalAmount < 0) {
//           couponData.max_discount = "Not Applicable";
//           totalAmount = subtotalAmount;
//         }
//       }
//     }

//     // =====================================
//     // AyuCash Calculation
//     // =====================================
//     const ayuCash = finalData.reduce((acc, item) => {
//       const product = item.productData.find((p) => p.id == item.productId);
//       return acc + (parseInt(product?.ayu_cash) || 0);
//     }, 0);

//     // =====================================
//     //  Ayushastra Brand check
//     // =====================================
//     let ayushastraBrandValue = 0;

//     for (const item of finalData) {
//       const product = item.productData.find(
//         (p) => p.id == item.productId && p.status === true
//       );

//       const brand = await Brand.findOne({
//         where: { id: product?.brand_id },
//       });

//       if (brand?.name?.toLowerCase() === "ayushsatra") {
//         ayushastraBrandValue += parseFloat(item.total) || 0;
//       }
//     }

//     let maxRedeemableAyuCash = 0;
//     let ayuCashMessage = "";

//     if (registerUser) {
//       if (subtotalAmount >= 500 && ayushastraBrandValue >= 200) {
//         maxRedeemableAyuCash = (subtotalAmount * 0.2).toFixed(2);
//         console.log(totalAmount);
//         console.log(maxRedeemableAyuCash);
//         console.log(registerUser.toJSON());
//         if (Number(registerUser?.ayucash_balance) < maxRedeemableAyuCash) {
//           totalAmount = ayu_cash_apply
//             ? totalAmount - Number(registerUser?.ayucash_balance)
//             : totalAmount;

//           ayuCashMessage = `You can redeem up to ₹${totalAmount} AyuCash.`;
//         } else {
//           totalAmount = ayu_cash_apply
//             ? totalAmount - maxRedeemableAyuCash
//             : totalAmount;
//           ayuCashMessage = `You can redeem up to ₹${maxRedeemableAyuCash} AyuCash.`;
//         }
//       } else {
//         if (subtotalAmount < 500)
//           ayuCashMessage =
//             "Cart value must be at least ₹500 to redeem AyuCash.";
//         if (ayushastraBrandValue < 200)
//           ayuCashMessage =
//             "You must have at least ₹200 of Ayushastra products to redeem AyuCash.";
//       }
//     }

//     let shippingCharge = totalAmount > 500 ? 0 : 79;

//     const responseData = {
//       cart_items: finalData,
//       order_summary: {
//         sub_total: parseInt(subtotalAmount.toFixed(2)),
//         ayu_cash: ayuCash,
//         shipping_charge: shippingCharge,
//         coupon_discount: couponData?.max_discount ?? 0,
//         total_amount: totalAmount + shippingCharge,
//         coupon_id: req.body.coupon_id ?? null,
//         maxRedeemableAyuCash:
//           registerUser?.ayucash_balance < Number(maxRedeemableAyuCash)
//             ? registerUser?.ayucash_balance
//             : maxRedeemableAyuCash,
//         ayuCashMessage,
//         ayu_cash_apply: registerUser ? ayu_cash_apply : null,
//       },
//     };

//     return Helper.response(
//       true,
//       "Cart list fetched successfully",
//       responseData,
//       res,
//       200
//     );
//   } catch (error) {
//     console.error("CartList Error:", error);
//     return Helper.response(
//       false,
//       "Error fetching cart list",
//       { message: error.message },
//       res,
//       500
//     );
//   }
// };

exports.getCartList = async (req, res) => {
  try {
    const deviceId = req.headers.deviceid;
    const { ayu_cash_apply = true } = req.body;

    if (!deviceId) {
      return Helper.response(false, "Device Id is required", [], res, 400);
    }

    // ---------------------------------------------------
    // CHECK LOGGED-IN USER
    // ---------------------------------------------------
    const token = (req.headers.authorization || "").split(" ")[1];
    const registerUser =
      token && token !== "null"
        ? await registered_user.findOne({ where: { token } })
        : null;

    // ---------------------------------------------------
    // MERGE GUEST CART AFTER LOGIN
    // ---------------------------------------------------
    if (registerUser) {
      await Helper.mergeGuestCartToUser(deviceId, registerUser.id);
    }

    // ---------------------------------------------------
    // CART WHERE CONDITION
    // ---------------------------------------------------
    let whereCondition = registerUser
      ? { registeruserId: registerUser.id }
      : { deviceId };

    const carts = await Cart.findAll({
      where: whereCondition,
      order: [["id", "DESC"]],
      raw: true,
    });

    if (!carts.length) {
      return Helper.response(false, "No carts found", [], res, 200);
    }

    // ---------------------------------------------------
    // CART MERGE WITH PRODUCT DATA (ARRAY)
    // ---------------------------------------------------
    let finalData = await Promise.all(
      carts.map(async (item) => {
        // productData MUST be an ARRAY
        const productData = await Product.findAll({
          where: { id: item.productId, status: true, isPublish: true },
          raw: true,
        });

        if (!productData.length) return null;

        const product = productData[0]; // take first item

        let cartQty = Number(item.quantity);
        let productQty = Number(product.maximum_qty || 0);

        // LIMIT cart qty to product stock
        if (cartQty > productQty) {
          cartQty = productQty;
        }

        return {
          ...item,
          quantity: cartQty,
          max_quantity: productQty,
          price: Number(item.price),
          total: cartQty * Number(item.price),
          productData, // ARRAY as you require
        };
      })
    );

    finalData = finalData.filter((item) => item !== null);

    // ---------------------------------------------------
    // SUBTOTAL
    // ---------------------------------------------------
    let subtotalAmount = finalData.reduce((acc, item) => acc + item.total, 0);
    let totalAmount = subtotalAmount;

    let couponData;

    // ---------------------------------------------------
    // APPLY COUPON
    // ---------------------------------------------------
    if (req.body.coupon_id) {
      couponData = await coupons.findOne({
        where: { id: req.body.coupon_id },
      });

      if (couponData) {
        totalAmount = subtotalAmount - couponData.max_discount;

        if (totalAmount < 0) {
          couponData.max_discount = "Not Applicable";
          totalAmount = subtotalAmount;
        }
      }
    }

    // ---------------------------------------------------
    // AYU CASH CALCULATION (productData is ARRAY)
    // ---------------------------------------------------
    const ayuCash = finalData.reduce((acc, item) => {
      const product = item.productData[0];
      return acc + (parseInt(product?.ayu_cash) || 0);
    }, 0);

    // ---------------------------------------------------
    // AYUSHASTRA BRAND CALCULATION (productData is ARRAY)
    // ---------------------------------------------------
    let ayushastraBrandValue = 0;

    for (const item of finalData) {
      const product = item.productData[0];

      const brand = await Brand.findOne({
        where: { id: product?.brand_id },
      });

      if (brand?.name?.toLowerCase() === "ayushsatra") {
        ayushastraBrandValue += Number(item.total);
      }
    }

    // ---------------------------------------------------
    // AYU CASH REDEEM RULES
    // ---------------------------------------------------
    let maxRedeemableAyuCash = 0;
    let ayuCashMessage = "";

    if (registerUser) {
      if (subtotalAmount >= 500 && ayushastraBrandValue >= 200) {
        maxRedeemableAyuCash = (subtotalAmount * 0.2).toFixed(2);

        if (Number(registerUser.ayucash_balance) < maxRedeemableAyuCash) {
          totalAmount = ayu_cash_apply
            ? totalAmount - Number(registerUser.ayucash_balance)
            : totalAmount;

          ayuCashMessage = `You can redeem up to ₹${Number(
            registerUser.ayucash_balance
          )}.`;
        } else {
          totalAmount = ayu_cash_apply
            ? totalAmount - maxRedeemableAyuCash
            : totalAmount;

          ayuCashMessage = `You can redeem up to ₹${maxRedeemableAyuCash}.`;
        }
      } else {
        if (subtotalAmount < 500)
          ayuCashMessage =
            "Cart value must be at least ₹500 to redeem AyuCash.";

        if (ayushastraBrandValue < 200)
          ayuCashMessage =
            "You must have at least ₹200 of Ayushastra products to redeem AyuCash.";
      }
    }

    // ---------------------------------------------------
    // SHIPPING
    // ---------------------------------------------------
    let shippingCharge = totalAmount > 500 ? 0 : 79;

    // ---------------------------------------------------
    // FINAL RESPONSE (unchanged)
    // ---------------------------------------------------
    const responseData = {
      cart_items: finalData,
      order_summary: {
        sub_total: Number(subtotalAmount.toFixed(2)),
        ayu_cash: ayuCash,
        shipping_charge: shippingCharge,
        coupon_discount: couponData?.max_discount ?? 0,
        total_amount: totalAmount + shippingCharge,
        coupon_id: req.body.coupon_id ?? null,
        maxRedeemableAyuCash:
          registerUser?.ayucash_balance < Number(maxRedeemableAyuCash)
            ? registerUser?.ayucash_balance
            : maxRedeemableAyuCash,
        ayuCashMessage,
        ayu_cash_apply: registerUser ? ayu_cash_apply : null,
      },
    };

    return Helper.response(
      true,
      "Cart list fetched successfully",
      responseData,
      res,
      200
    );
  } catch (error) {
    console.error("CartList Error:", error);
    return Helper.response(
      false,
      "Error fetching cart list",
      { message: error.message },
      res,
      500
    );
  }
};


// exports.getCartList = async (req, res) => {
//   try {
//     const deviceId = req.headers.deviceid;
//     if (!deviceId) return Helper.response(false, "Device ID required", [], res, 400);

//     const token = (req.headers.authorization || "").split(" ")[1];

//     const registerUser = (token && token !== "null")
//       ? await registered_user.findOne({ where: { token } })
//       : null;

//     // 🔥 Merge guest cart → user cart if logged in
//     if (registerUser) {
//       await Helper.mergeCartOnLogin(deviceId, registerUser.id);
//     }

//     const where = registerUser
//       ? { registeruserId: registerUser.id }
//       : { deviceId };

//     const cartItems = await Cart.findAll({ where, order: [["id", "DESC"]] });

//     return Helper.response(true, "Cart loaded", cartItems, res, 200);

//   } catch (err) {
//     console.log(err,"errror:");

//     return Helper.response(false, err?.message, err, res, 500);
//   }
// };

exports.getCheckOutCartList = async (req, res) => {
  try {
    const deviceId = req?.headers?.deviceid;
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];

    const token = authHeader?.split(" ")[1];

    const registerUserId = token
      ? await registered_user.findOne({
          where: {
            token,
          },
        })
      : null;

    if (!deviceId) {
      return Helper.response(false, "Device ID is required", [], res, 400);
    }
    let whereCondition = { deviceId };
    if (registerUserId) {
      whereCondition.registeruserId = registerUserId.id;
    }

    const carts = await Cart.findAll({
      where: whereCondition,
      order: [["id", "DESC"]],
      raw: true,
    });

    if (!carts || carts.length == 0) {
      return Helper.response(false, "No carts found", [], res, 200);
    }

    let finalData = await Promise.all(
      carts.map(async (item) => {
        const productData = await Product.findAll({
          where: {
            id: item.productId,
            status: true,
            isPublish: true,
          },
          order: [["id", "ASC"]],
          raw: true,
        });
        if (!productData || productData.length == 0) return null;

        return {
          ...item,
          quantity: parseFloat(item.quantity),
          total: parseFloat(item.total),
          price: parseFloat(item.price),
          productData,
        };
      })
    );
    finalData = finalData.filter((item) => item != null);
    let subtotalAmount = finalData.reduce((acc, item) => acc + item.total, 0);
    let totalAmount = finalData.reduce((acc, item) => acc + item.total, 0);
    let couponData;

    if (req.body.coupon_id) {
      couponData = await coupons.findOne({
        where: {
          id: req.body?.coupon_id,
        },
      });

      totalAmount = subtotalAmount - couponData?.max_discount;
      if (totalAmount < 0) {
        totalAmount = totalAmount + couponData?.max_discount;
        if (couponData) {
          couponData.max_discount = "Not Applicable";
        }
        // return Helper.response(false,"Not Applicable For this Prodcut", [],res,200)
      }

      // if(totalAmount<couponData?.min_amount){
      //     Helper.response(false,"Not Applicable For this Prodcut", [],res,200)
      // }
      // else if(totalAmount>couponData?.max_discount){
      //     Helper.response(false,"Not Applicable For this Prodcut", [],res,200)
      // }
      // else{

      // }
    }

    if (finalData.length == 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }

    const ayuCash = finalData.reduce((acc, item) => {
      const product = item.productData.find(
        (product) => product.id == item.productId
      );
      return acc + (parseInt(product?.ayu_cash) || 0);
    }, 0);

    const responseData = {
      cart_items: finalData,
      order_summary: {
        sub_total: subtotalAmount || 0,
        ayu_cash: ayuCash || 0,
        shipping_charge: totalAmount > 500 ? 0 : 79,
        coupon_discount: couponData?.max_discount ?? 0,
        total_amount: totalAmount > 500 ? totalAmount : totalAmount + 79,
        coupon_id: req.body.coupon_id ? req.body.coupon_id : null,
      },
    };

    return Helper.response(
      true,
      "Cart list fetched successfully",
      responseData,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      "Error fetching cart list",
      { message: error.message },
      res,
      500
    );
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { productId, price, quantity, total, status } = req.body;
    const deviceId = req?.headers?.deviceid;

    if (!deviceId) {
      return Helper.response(false, "Device ID is required", [], res, 400);
    }

    const token = req.headers["authorization"]?.split(" ")[1];

    //  console.log(token,"token  ---");

    let registerUser = null;
    if (token && token != "null" && token != null && token != undefined) {
      registerUser = await registered_user.findOne({
        where: { token, isDeleted: false },
      });
      if (!registerUser) {
        return Helper.response(false, "No User Found", [], res, 200);
      }
    }

    let whereCondition = {};

    if (registerUser) {
      whereCondition.registeruserId = registerUser.id;
    } else {
      whereCondition.deviceId = deviceId;
    }
    if (productId) {
      whereCondition.productId = productId;
    }
    const product = await Product.findOne({
      where: { id: productId },
    });
    if (!product) {
      return Helper.response(false, "Product not found", {}, res, 200);
    }
    if (Number(quantity) > Number(product.maximum_qty)) {
      return Helper.response(
        false,
        `Maximum quantity for this product is ${product.maximum_qty}`,
        {},
        res,
        200
      );
    }
    const cart = await Cart.findOne({ where: whereCondition });

    if (!cart) {
      return Helper.response(false, "Cart not found", {}, res, 404);
    }

    if (Number(quantity) <= 0) {
      await cart.destroy();
      return Helper.response(
        true,
        "Cart item removed successfully",
        {},
        res,
        200
      );
    }

    // await cart.update({
    //   price: price * quantity ?? parseFloat(cart.price) * quantity,
    //   quantity: quantity ?? cart.quantity,
    //   total: total  ?? parseFloat(cart.price) * quantity,
    //   status: status ?? cart.status,
    // });
    await cart.update({
      price: cart.price,
      quantity: quantity ?? cart.quantity,
      total: parseFloat(cart.price) * quantity,
      status: status ?? cart.status,
    });

    return Helper.response(true, "Cart updated successfully", cart, res, 200);
  } catch (error) {
    console.error("updateCart error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.deleteCart = async (req, res) => {
  try {
    const { id, productId } = req.body;

    if (!id && !productId) {
      return Helper.response(false, "Id is required", {}, res, 400);
    }
    const deviceId = req?.headers?.deviceid;
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];

    const token = authHeader?.split(" ")[1];

    const Userdata = await User.findOne({
      where: {
        token,
      },
    });
    let deletedId;
    if (!Userdata) {
      const RegisterUser = await registered_user.findOne({
        where: {
          token,
        },
      });

      if (RegisterUser) {
        deletedId = RegisterUser?.id;
      }
    } else {
      deletedId = Userdata?.id;
    }

    if (id == "app_clear_all") {
      await Cart.destroy({
        where: {
          registeruserId: deletedId,
        },
      });
      // await Cart.destroy({ where: { deviceId: deviceId } });
      return Helper.response(
        true,
        "All cart items cleared successfully",
        {},
        res,
        200
      );
    }
    if (id == "clear_all") {
      if (!deviceId || deviceId == undefined || deviceId == "") {
        return Helper.response(false, "Device ID is required", [], res, 400);
      }
      deletedId = deletedId == undefined ? null : deletedId;
      await Cart.destroy({
        where: {
          [Op.or]: {
            deviceId: deviceId,
            registeruserId: deletedId,
          },
        },
      });
      // await Cart.destroy({ where: { deviceId: deviceId } });
      return Helper.response(
        true,
        "All cart items cleared successfully",
        {},
        res,
        200
      );
    }

    let whereCondition = {};

    if (productId) {
      whereCondition.productId = productId;
    }
    if (!token || token == "null") {
      whereCondition.deviceId = deviceId;
    }

    if (id && id !== "clear_all") {
      whereCondition.id = id;
    }

    const cart = await Cart.findOne({ where: whereCondition });

    if (!cart) {
      return Helper.response(false, "cart not found", {}, res, 404);
    }

    // const cart = await Cart.findByPk(id);
    // if (!cart) {
    //   return Helper.response(false, "Cart not found", {}, res, 404);
    // }
    await cart.destroy();
    return Helper.response(true, "Cart deleted successfully", {}, res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error deleting cart",
      res,
      500
    );
  }
};

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

    return Helper.response(
      true,
      "Wishlist item deleted successfully",
      {},
      res,
      200
    );
  } catch (error) {
    console.error("Error deleting wishlist:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};
