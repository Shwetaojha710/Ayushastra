const Cart = require("../../../model/cart");
const Product = require("../../../model/product");
const Coupon = require("../../../model/coupon");
const Helper = require("../../helper/helper");
const { Op, where } = require("sequelize");
const registered_user = require("../../../model/registeredusers");
const coupons = require("../../../model/coupon");
exports.addCart = async (req, res) => {
  try {
    const { productId, price, quantity, total, status=true } = req.body;

    const deviceId = req?.headers?.deviceid;
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];

    const token = authHeader?.split(" ")[1]; // e.g. "Bearer <token>"


    const registerUser = token
      ? await registered_user.findOne({
          where: { token },
        })
      : null;


    if (!deviceId || deviceId.trim() === "") {
      return Helper.response(false, "Device ID is required", [], res, 400);
    }

    if (!productId) {
      return Helper.response(false, "Product ID is required", [], res, 400);
    }


    const whereCondition = { productId, deviceId };
    if (registerUser) whereCondition.registeruserId = registerUser.id;

    const existingCart = await Cart.findOne({ where: whereCondition });

    if (existingCart) {

      const newQuantity = existingCart.quantity + (quantity || 1);
      const newTotal = price * newQuantity;

      await existingCart.update({ quantity: newQuantity, total: newTotal });
      return Helper.response(true, "Cart updated successfully", existingCart, res, 200);
    }

    const cart = await Cart.create({
      productId,
      price,
      quantity: quantity || 1,
      total: total || price,
      status: status ,
      deviceId,
      registeruserId: registerUser ? registerUser.id : null,
    });

    return Helper.response(true, "Cart added successfully", cart, res, 201);
  } catch (error) {
    console.error("AddCart Error:", error);
    return Helper.response(false, error.message, "Error adding cart", res, 500);
  }
};


exports.getCartList = async (req, res) => {
  try {
    const deviceId = req?.headers?.deviceid;
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    // console.log(authHeader,"authHeader");
    
    const token =authHeader?.split(' ')[1]
  
    const registerUserId= token ? await registered_user.findOne({
      where:{
        token
      }
    }):null

   
  
    if (!deviceId) {
      return Helper.response(false, "Device ID is required", [], res, 400);
    }
      let whereCondition ={deviceId}
    if(registerUserId){
          whereCondition.registeruserId=registerUserId.id
    }

    const carts = await Cart.findAll({
      where: whereCondition,
      order: [["id", "DESC"]],
      raw: true,
    });

    if (!carts || carts.length == 0) {
      return Helper.response(false, "No carts found", [], res, 404);
    }

    const finalData = await Promise.all(
      carts.map(async (item) => {
        const productData = await Product.findAll({
          where: {
            id: item.productId,
            status: true,
          },
          order: [["id", "ASC"]],
          raw: true,
        });

      

        return {
          ...item,
          quantity: parseFloat(item.quantity),
          total: parseFloat(item.total),
          price: parseFloat(item.price),
          productData,
        };
      })
    );
   
    let subtotalAmount = finalData.reduce((acc, item) => acc + item.total, 0);
    let totalAmount = finalData.reduce((acc, item) => acc + item.total, 0);
    let couponData
    if(req.body.coupon_id){
    couponData =await coupons.findOne({
      where:{
        id:req.body?.coupon_id
      }
    })

    // if(totalAmount<couponData?.min_amount){
    //     Helper.response(false,"Not Applicable For this Prodcut", [],res,200)
    // }
    // else if(totalAmount>couponData?.max_discount){
    //     Helper.response(false,"Not Applicable For this Prodcut", [],res,200)
    // }
    // else{
      totalAmount=subtotalAmount-couponData?.max_discount
    // }
    
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
        sub_total: subtotalAmount||0,
        ayu_cash: ayuCash ||0,
        shipping_charge: 0,
        coupon_discount: couponData?.max_discount??0,
       total_amount: totalAmount ||0,
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

 
    const token = req.headers["authorization"]?.split(' ')[1];

   
    let registerUser = null;
    if (token) {
      registerUser = await registered_user.findOne({ where: { token } });
    }


    let whereCondition = { deviceId };

    if (registerUser) {
      whereCondition.registeruserId = registerUser.id;
    }
    if (productId) {
      whereCondition.productId = productId;
    }


    const cart = await Cart.findOne({ where: whereCondition });

    if (!cart) {
      return Helper.response(false, "Cart not found", {}, res, 404);
    }


    if (Number(quantity) <= 0) {
      await cart.destroy();
      return Helper.response(true, "Cart item removed successfully", {}, res, 200);
    }


    await cart.update({
      price: price ?? cart.price,
      quantity: quantity ?? cart.quantity,
      total: total ?? cart.total,
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
    const { id } = req.body;
    if(id===undefined || id===""){
      return Helper.response(false, "Cart ID is required", {}, res, 400);
    }
    if(id=="clear_all"){
      const deviceId = req?.headers?.deviceid;
      if (!deviceId || deviceId == undefined || deviceId == "") {
        return Helper.response(false, "Device ID is required", [], res, 400);
      }
      await Cart.destroy({ where: { deviceId: deviceId } });
      return Helper.response(true, "All cart items cleared successfully", {}, res, 200);
    }
    const cart = await Cart.findByPk(id);
    if (!cart) {
      return Helper.response(false, "Cart not found", {}, res, 404);
    }
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
