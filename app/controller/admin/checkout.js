const Otp = require("../../../model/otp");
const User = require("../../../model/user");
const Address = require("../../../model/address");
const Order = require("../../../model/order");
const OrderItem = require("../../../model/OrderItem");
const Payment = require("../../../model/payment");
const Helper = require("../../helper/helper");
const sequelize = require("../../connection/connection");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const Product = require("../../../model/product");
const registered_user = require("../../../model/registeredusers");
const coupons = require("../../../model/coupon");
const Cart = require("../../../model/cart");


exports.sendOtp = async (req, res) => {
  try {
    const data = req.body;
    const { mobile } = req.body;
    if(!mobile||mobile === undefined || mobile === null || mobile === ""){

      return Helper.response(false, "Mobile number is required", {}, res, 200);
    }
    const user = await User.findOne({
      where: {
        mobile,
        status:true,
      },
    });
   

    const otps = new Otp();

    const templateId = "1407168931814895829";
    // otps.otp = Math.floor(1000 + Math.random() * 9000);
    otps.otp = 1234;
    otps.mobile = mobile;

    otps.ip = Helper.getLocalIP();
    otps.type = "App";
    otps.expiry_time = `'${moment().add(5, "minutes").toDate()}'`;
    otps.created_by = null;

    const createOTP = await otps.save();

    if (createOTP) {
        // await Helper.sendSMS(data.mobile, otps.otp, templateId);
      return Helper.response(true, "OTP Send Successfully", {}, res, 200);
    } else {
      return Helper.response(false, "Unable to sent OTP!", {}, res, 200);
    }
  } catch (error) {
    console.log(error);
    return Helper.response(false, error?.message, {}, res, 200);
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { mobile, otp, deviceToken,email,first_name,last_name } = req.body;
    const deviceId = req?.headers?.deviceid || null;
   if (!deviceId) {
      return Helper.response(false, "Device ID is required", {}, res, 400); 
   }
   
    if (!mobile || !otp) {
      return Helper.response(
        "failed",
        "Please provide both mobile number and OTP.",
        {},
        res,
        200
      );
    }

 
    const otpRecord = await Otp.findOne({
      where: { mobile, otp , status: true },
    });

    if (!otpRecord) {
      return Helper.response(false, "Invalid OTP.", {}, res, 200);
    }

 
    const now = new Date();
    const expiryTime = new Date(otpRecord.expiry_time);

    if (now > expiryTime) {
      return Helper.response(false, "OTP expired.", {}, res, 200);
    }

  
    await Otp.update(
      { status: false },
      { where: { mobile, otp } }
    );

   
    let user = await User.findOne({ where: { mobile }, raw: false });

    if (!user) {
      const registerUser=await registered_user.findOne({
        where:{
          mobile
        }
      })
      
      if(!registerUser){
       user = await User.create({
        first_name: first_name || "",
        last_name:last_name || "",
        email: email || "",
        mobile,
        password_hash: "",
        deviceId,
        status: true,
      });
      }
      else{
          user = await User.create({
        first_name: registerUser?.first_name || "",
        last_name:registerUser?.last_name || "",
        email: registerUser?.email || "",
        mobile,
        password_hash: registerUser?.password,
        deviceId,
        status: true,
      });
      }

    
    }


    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY);


    user.deviceToken = deviceToken || null;
    user.token = token;
    await user.save();


    const userData = user.toJSON();

    const addresses = await Address.findAll({
      where: { user_id: user.id },
      raw: true,
    });

    userData.address = addresses || [];
    userData.token = token;


    return Helper.response(
     true,
      "OTP verified successfully.",
      userData,
      res,
      200
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return Helper.response(false, error.message, {}, res, 200);
  }
};



// exports.checkOut = async (req, res) => {
//   const transaction = await sequelize.transaction();

//   try {
//     const {
//       first_name,
//       last_name,
//       email,
//       mobile,
//       alter_mobile,
//       address,
//       city,
//       state,
//       country,
//       zip_code,
//       cart_items,
//       payment_method,
//       total_amount
//     } = req.body;

    
//     if (
//       !first_name || !last_name || !email || !mobile ||
//       !address || !city || !state || !country ||
//       !zip_code || !Array.isArray(cart_items) || cart_items.length === 0
//        || !total_amount
//     ) {
//       return Helper.response(false, "Please provide all required fields", {}, res, 400);
//     }
//  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

//     const token = authHeader?.split(" ")[1]; 


//     const registerUser = token
//       ? await registered_user.findOne({
//           where: { token },
//         })
//       : null;
  
//       if(registerUser){

//      let user = await registered_user.findOne({ where: { mobile }, transaction });

//      if (!user) {
//       // user = await User.create({
//       //   first_name,
//       //   last_name,
//       //   email,
//       //   mobile,
//       //   alter_mobile
//       // }, { transaction });
//       return Helper.response(false, "User not found with the provided mobile Number", {}, res, 404);
   
//     }
//     updateuser=await registered_user.update(
//         { 
//         deviceId: req?.headers?.deviceid || null ,
//         first_name,
//         last_name,
//         email,
//         mobile,
//         alter_mobile
//         },
//         { where: { mobile: mobile }, transaction }
//       ); 
   
//     const Createaddress = await Address.create({
//       user_id: user.id,
//       address,
//       city,
//        mobile,
//       state,
//       country,
//       postal_code: zip_code,
//       address_line2: req.body.address_line2 || "",
//     }, { transaction });

   

//     const order = await Order.create({
//       user_id: user.id,
//       shipping_address_id: Createaddress.id,
//       billing_address_id: Createaddress.id, // same for now
//       total_amount,
//       subtotal: total_amount, // optional: you can calculate based on items
//       payment_status: "paid",
//       order_status: "placed",
//       user_type:"registered_user",
//       order_no:await Helper.generateOrderNumber()
//     }, { transaction });

 
//     for (const item of cart_items) {
//       const { productId, quantity, price,total } = item;

//       if (!productId || !quantity || !price||!total) {
//         await transaction.rollback();
//         return Helper.response(false, "Invalid cart item details", {}, res, 400);
//       }

//       await OrderItem.create({
//         order_id: order.id,
//         product_id:productId,
//         quantity,
//         unit_price: price,
//         total: total,
//       }, { transaction });


//     }

      

//          await Cart.destroy({
//           where:{
//             registeruserId:registerUser?.id
//           }
//         })

//       }else{
//      let user = await User.findOne({ where: { mobile }, transaction });

//      if (!user) {
//       // user = await User.create({
//       //   first_name,
//       //   last_name,
//       //   email,
//       //   mobile,
//       //   alter_mobile
//       // }, { transaction });
//       return Helper.response(false, "User not found with the provided mobile Number", {}, res, 404);
   
//     }
//     updateuser=await User.update(
//         { 
//         deviceId: req?.headers?.deviceid || null ,
//         first_name,
//         last_name,
//         email,
//         mobile,
//         alter_mobile
//         },
//         { where: { mobile: mobile }, transaction }
//       ); 
   
//     const Createaddress = await Address.create({
//       user_id: user.id,
//       address,
//       city,
//        mobile,
//       state,
//       country,
//       postal_code: zip_code,
//       address_line2: req.body.address_line2 || "",
//     }, { transaction });

   

//     const order = await Order.create({
//       user_id: user.id,
//       shipping_address_id: Createaddress.id,
//       billing_address_id: Createaddress.id, // same for now
//       total_amount,
//       subtotal: total_amount, // optional: you can calculate based on items
//       payment_status: "paid",
//       order_status: "placed",
//        user_type:"user",
//       order_no:await Helper.generateOrderNumber()
//     }, { transaction });

 
//     for (const item of cart_items) {
//       const { productId, quantity, price,total } = item;

//       if (!productId || !quantity || !price||!total) {
//         await transaction.rollback();
//         return Helper.response(false, "Invalid cart item details", {}, res, 400);
//       }

//       await OrderItem.create({
//         order_id: order.id,
//         product_id:productId,
//         quantity,
//         unit_price: price,
//         total: total,
//       }, { transaction });


//     }

//        await Cart.destroy({
//           where:{
//             deviceId
//           }
//         })

//       }

  

   

//       // if(registerUser){
//       //   await Cart.destroy({
//       //     where:{
//       //       registeruserId:registerUser?.id
//       //     }
//       //   })
//       // }else{
//       //   await Cart.destroy({
//       //     where:{
//       //       deviceId
//       //     }
//       //   })
//       // }

    
//     // await Payment.create({
//     //   order_id: order.id,
//     //   payment_method,
//     //   amount: total_amount,
//     //   payment_status: "pending"
//     // }, { transaction });

 
//     await transaction.commit();

//     return Helper.response(true, "Checkout completed successfully", { order_id: order.id }, res, 200);

//   } catch (error) {
//     console.error("Error in checkout:", error);
//     await transaction.rollback();
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

exports.checkOut = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      first_name,
      last_name,
      email,
      mobile,
      alter_mobile,
      address,
      city,
      state,
      country,
      zip_code,
      cart_items,
      payment_method,
      total_amount,
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !email ||
      !mobile ||
      !address ||
      !city ||
      !state ||
      !country ||
      !zip_code ||
      !Array.isArray(cart_items) ||
      cart_items.length === 0 ||
      !total_amount
    ) {
      return Helper.response(
        false,
        "Please provide all required fields",
        {},
        res,
        400
      );
    }

    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];
    const token = authHeader?.split(" ")[1];
    const deviceId = req?.headers?.deviceid || null;

    const registerUser = token
      ? await registered_user.findOne({ where: { token } })
      : null;

    // Determine if user is registered or guest
    const userModel = registerUser ? registered_user : User;
    const userType = registerUser ? "registered_user" : "user";

    const user = await userModel.findOne({ where: { mobile }, transaction });

    if (!user) {
      await transaction.rollback();
      return Helper.response(
        false,
        "User not found with the provided mobile number",
        {},
        res,
        404
      );
    }

    // Update user information
    await userModel.update(
      {
        deviceId,
        first_name,
        last_name,
        email,
        mobile,
        alter_mobile,
      },
      { where: { mobile }, transaction }
    );

    // Create or update address
    const createdAddress = await Address.create(
      {
        user_id: user.id,
        address,
        city,
        mobile,
        state,
        country,
        postal_code: zip_code,
        address_line2: req.body.address_line2 || "",
      },
      { transaction }
    );

    // Create order
    const order = await Order.create(
      {
        user_id: user.id,
        shipping_address_id: createdAddress.id,
        billing_address_id: createdAddress.id,
        total_amount,
        subtotal: total_amount,
        payment_status: "paid",
        order_status: "placed",
        user_type: userType,
        order_no: await Helper.generateOrderNumber(),
      },
      { transaction }
    );

    // Create order items
    for (const item of cart_items) {
      const { productId, quantity, price, total } = item;
      if (!productId || !quantity || !price || !total) {
        await transaction.rollback();
        return Helper.response(false, "Invalid cart item details", {}, res, 400);
      }

      await OrderItem.create(
        {
          order_id: order.id,
          product_id: productId,
          quantity,
          unit_price: price,
          total,
        },
        { transaction }
      );
    }

    // Clear cart
    if (registerUser) {
      await Cart.destroy({
        where: { registeruserId: registerUser.id },
        transaction,
      });
    } else {
      await Cart.destroy({
        where: { deviceId },
        transaction,
      });
    }

    // Commit all transactions
    await transaction.commit();

    return Helper.response(
      true,
      "Checkout completed successfully",
      { order_id: order.id },
      res,
      200
    );
  } catch (error) {
    console.error("Error in checkout:", error);
    await transaction.rollback();
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.getOrderList = async (req, res) => {
  try {
   
    const { id } = req.users; // optional: filter by user_id

    let whereCondition = {};
    if (id) whereCondition.user_id = id;

    const orders = await Order.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
    });

    const data =await Promise.all(
             orders.map(async(item)=>{
             let order_item= await OrderItem.findAll({
              where:{
                id:item?.order_id
              },
              raw:true,
              order:["id","desc"]
             })
            
             const productdata=await Product.findAll({
              where:{
                  id:{
                  [Op.in]: order_item.map((item) => item.product_id)
                  }
              }
             })

           return{
            ...item,
            productData:productdata??[],
            OrderItem:order_item??[]
           }

             })
    )

    return Helper.response(true,"Order list fetched successfully",data,res,200)
    // return res.status(200).json({
    //   success: true,
    //   message: "Order list fetched successfully",
    //   data: orders,
    // });
  } catch (error) {
    console.error("Order List Error:", error);
    return Helper.response(false,error?.message,{},res,500)
  
  }
};


exports.CouponList = async (req, res) => {
  try {
   
    const Coupon = await coupons.findAll({
      order: [["id", "DESC"]],
      raw:true
    });
    return Helper.response(true,"Coupon list fetched successfully",Coupon,res,200)
 
  } catch (error) {
    console.error("Order List Error:", error);
    return Helper.response(false,error?.message,{},res,500)
  
  }
};

