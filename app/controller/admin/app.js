const Otp = require("../../model/otp");
const User = require("../../model/user");
const Address = require("../../model/address");
const Order = require("../../model/order");
const OrderItem = require("../../model/orderItem");
const Payment = require("../../model/payment");
const Helper = require("../../helper/helper");
const sequelize = require("../../connection/connection");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const Product = require("../../model/product");
const registered_user = require("../../model/registeredusers");
const Coupons = require("../../model/coupon");
const Cart = require("../../model/cart");
const { Op, literal,col } = require("sequelize");
const referral_master = require("../../model/referral_master");
const UserMonthPoints = require("../../model/user_month_points");
const prakritiQuiz = require("../../model/prakriti_quiz");
const ImmunityQuiz = require("../../model/immunity_quiz");
const product_gallery = require("../../model/product_gallery");
const wishlist = require("../../model/wishlist");
const Diseases = require("../../model/diseases");
const ingredient = require("../../model/ingredient");
const Category = require("../../model/category");
const Brand = require("../../model/brand");
const ProductType = require("../../model/product_type");
const Unit = require("../../model/unit");
const coupons = require("../../model/coupon");

exports.AppsendOtp = async (req, res) => {
  try {
    const { username, email, type, password } = req.body;

    if (!type) {
      return Helper.response(false, "type is required", {}, res, 400);
    }

    if (type === "M" && !username) {
      return Helper.response(false, "Mobile number is required", {}, res, 400);
    }

    if (type === "E" && !username) {
      return Helper.response(false, "Email is required", {}, res, 400);
    }

    // -------------------------
    // FIND USER
    // -------------------------
    let user = await registered_user.findOne({
      where: {
        ...(type == "M" ? { mobile: username } : {}),
        ...(type == "E" ? { email: username } : {}),
      },
    });

    // -------------------------
    // CASE 1: PASSWORD LOGIN
    // -------------------------
    if (password && user) {
      const decrypted = Helper.decryptPassword(user.password);
      if (password !== decrypted) {
        return Helper.response(false, "Invalid password!", {}, res, 401);
      }

      // No OTP needed — Login directly
      return Helper.response(
        true,
        "Login successful using password",
        { isReg: true, user_id: user.id },
        res,
        200
      );
    }

    // -------------------------
    // CASE 2: SEND OTP (User exists OR new user)
    // -------------------------

    const otpValue = 1234; // You can replace with random OTP

    const otps = await Otp.create({
      otp: otpValue,
      mobile: type == "M" ? username : null,
      email: type == "E" ? username : null,
      ip: Helper.getLocalIP(),
      type: "App",
      expiry_time: `'${moment().add(5, "minutes").toDate()}'`,
      created_by: user ? user.id : null,
    });

    if (!otps) {
      return Helper.response(false, "Unable to send OTP!", {}, res, 200);
    }

    // await Helper.sendSMS(mobile, otpValue, templateId);

    return Helper.response(
      true,
      "OTP sent successfully",
      { isReg: !!user },
      res,
      200
    );
  } catch (error) {
    console.log(error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.AppverifyOtp = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      username,
      otp,
      type,
      deviceToken,
      first_name,
      last_name,
      referred_by,
    } = req.body;
    const deviceId = req.headers?.deviceid;

 

    if (!otp) {
      return Helper.response(false, "OTP is required", {}, res, 400);
    }

    let whereOtp = {};

    if (type == "M") {
      if (!username)
        return Helper.response(false, "Mobile is required", {}, res, 400);
      whereOtp.mobile = username;
    } else if (type == "E") {
      if (!username)
        return Helper.response(false, "Email is required", {}, res, 400);
      whereOtp.email = username;
    } else {
      return Helper.response(false, "Invalid type", {}, res, 200);
    }

    whereOtp.otp = otp;
    whereOtp.status = true;


    const otpRecord = await Otp.findOne({ where: whereOtp });

    if (!otpRecord) {
      return Helper.response(false, "Invalid OTP", {}, res, 200);
    }

    if (new Date() > new Date(otpRecord.expiry_time)) {
      return Helper.response(false, "OTP expired", {}, res, 200);
    }

  
    await Otp.update({ status: false }, { where: whereOtp });

    let findUser = await registered_user.findOne({
      where: {
        ...(type === "M" ? { mobile: username } : {}),
        ...(type === "E" ? { email: username } : {}),
        isDeleted: false,
      },
    });

    let isNewUser = false;
    let referrerUser = null;

 
    if (!findUser) {
      isNewUser = true;

      let referralCode = Helper.generateReferralCode(first_name || "USR");
      let codeExists = await registered_user.findOne({
        where: { referral_code: referralCode },
      });
      if (codeExists)
        referralCode = Helper.generateReferralCode(first_name || "USR");


      const referralMaster = await referral_master.findOne({
        order: [["createdAt", "desc"]],
      });

      const newRegisterBonus = Number(referralMaster?.new_register || 500);
      const refereeBonus = Number(referralMaster?.referee_bonus || 250);
      const referrerBonus = Number(referralMaster?.referrer_bonus || 250);

      let newUserBalance = newRegisterBonus;

      if (referred_by) {
        referrerUser = await registered_user.findOne({
          where: { referral_code: referred_by, isDeleted: false },
        });

        if (referrerUser) {
          newUserBalance = newRegisterBonus + refereeBonus;
        }
      }
     const password= Helper.encryptPassword('admin@1234')
     const coonfirmPassword= Helper.encryptPassword('admin@1234')
     
      findUser = await registered_user.create(
        {
          mobile: type == "M" ? username : null,
          email: type == "E" ? username : null,
          first_name,
          last_name,
          password: "",
          confirmPassword: "",
          isDeleted: false,
          isemail_verified: type == "E" ?true : false,
          isMobile_verified: type == "M" ? true : false,
          device_id: deviceId,
          type: type == "M" ? "mobile" : "email",
          referral_code: referralCode,
          referred_by: referrerUser?.id || null,
          ayucash_balance: newUserBalance,
        },
        { transaction: t }
      );

      // Add points in user_month_points
      const month = Helper.getCurrentMonth().split("-")[1];
      const year = Helper.getCurrentMonth().split("-")[0];

      if (referrerUser) {
        await UserMonthPoints.create(
          {
            parent_id: referrerUser.id,
            child_id: findUser.id,
            month,
            year,
            ayu_points: refereeBonus,
          },
          { transaction: t }
        );

        // update referrer wallet
        await registered_user.update(
          {
            ayucash_balance:
              Number(referrerUser.ayucash_balance || 0) + referrerBonus,
          },
          { where: { id: referrerUser.id }, transaction: t }
        );
      } else {
        await UserMonthPoints.create(
          {
            parent_id: findUser.id,
            child_id: null,
            month,
            year,
            ayu_points: newRegisterBonus,
          },
          { transaction: t }
        );
      }
    }

    // -----------------------
    // GENERATE TOKEN
    // -----------------------
    const token = jwt.sign({ id: findUser.id }, process.env.SECRET_KEY);

    await findUser.update(
      { token, deviceToken: deviceToken || null },
      { transaction: t }
    );

    await t.commit();

    // Fetch user addresses
    const addressList = await Address.findAll({
      where: { user_id: findUser.id, user_type: "registered_user" },
      raw: true,
    });

    return Helper.response(
      true,
      "OTP Verified Successfully",
      {
        id: findUser.id,
        first_name: findUser.first_name,
        last_name: findUser.last_name,
        mobile: findUser.mobile,
        email: findUser.email,
        token,
        referral_code: findUser.referral_code,
        ayucash_balance: findUser.ayucash_balance,
        newUser: isNewUser,
        address: addressList,
        type: type === "M" ? "mobile" : "email",
      },
      res,
      200
    );
  } catch (error) {
    await t.rollback();
    console.error("OTP Verify Error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};


exports.UserProfile = async (req, res) => {
  try {
    const userId = req.users?.id;

    if (!userId) {
      return Helper.response(false, "User ID required", {}, res, 400);
    }

    // -----------------------------------------------------------
    // 1️⃣ Fetch User Basic Profile
    // -----------------------------------------------------------
    let userData = await registered_user.findOne({
      where: { id: userId },
      attributes: [
        "first_name",
        "last_name",
        "mobile",
        "email",
        "profile_image",
        "status",
        "gender",
        "isMobile_verified",
        "isemail_verified",
        "ayucash_balance",
        "referral_code"
      ],
      raw: true
    });

    if (!userData) {
      return Helper.response(false, "User not found", {}, res, 404);
    }

    // -----------------------------------------------------------
    // 2️⃣ TOTAL ORDERS
    // -----------------------------------------------------------
    const totalOrders = await Order.count({
      where: { user_id: userId, user_type: "registered_user" }
    });

    // -----------------------------------------------------------
    // 3️⃣ UPCOMING ORDERS
    // -----------------------------------------------------------
    const upcomingOrders = await Order.count({
      where: {
        user_id: userId,
        user_type: "registered_user",
        order_status: { [Op.in]: ["placed", "processing"] }
      }
    });

    // -----------------------------------------------------------
    // 4️⃣ TOTAL REFERRALS
    // -----------------------------------------------------------
    const totalReferrals = await registered_user.count({
      where: { referred_by: userId, isDeleted: false }
    });

    // -----------------------------------------------------------
    // 5️⃣ TOTAL CONSULTATION
    // -----------------------------------------------------------
    // const totalConsultation = await Consultation.count({
    //   where: { user_id: userId }
    // });

    // // Upcoming consultations → future scheduled dates
    // const upcomingConsultation = await Consultation.count({
    //   where: {
    //     user_id: userId,
    //     consultation_date: { [Op.gt]: new Date() }
    //   }
    // });

    // -----------------------------------------------------------
    // 6️⃣ PRAKRITI TEST COUNT
    // -----------------------------------------------------------
    const prakritiTest = await prakritiQuiz.count({
      where: { user_id: userId }
    });

    // -----------------------------------------------------------
    // 7️⃣ IMMUNITY TEST COUNT
    // -----------------------------------------------------------
    const immunityTest = await ImmunityQuiz.count({
      where: { user_id: userId }
    });

    // -----------------------------------------------------------
    // FINAL RESPONSE → Combine all data
    // -----------------------------------------------------------

    userData.isMobile_verified = userData.isMobile_verified ?? false;
    userData.isemail_verified = userData.isemail_verified ?? false;
    userData.gender = userData.gender ?? null;
    userData.profile_image = userData.profile_image ?? "";
    userData.status = userData.status ?? false;

    return Helper.response(
      true,
      "User profile fetched successfully",
      {
        profile: userData,
        stats: {
          totalOrders,
          upcomingOrders,
          totalReferrals,
          ayuCashBalance: userData?.ayucash_balance || 0,
          totalConsultation:0,
          upcomingConsultation:0,
          prakritiTest,
          immunityTest,
        }
      },
      res,
      200
    );

  } catch (error) {
    console.log("error:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};


exports.UpdateUserProfile = async (req, res) => {
  try {
    const id = req.users?.id;
    const { first_name, last_name, mobile, email,gender } = req.body;

    if (!id) {
      return Helper.response(false, "Token is required", {}, res, 400);
    }

    const user = await registered_user.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      return Helper.response(false, "User not found", {}, res, 404);
    }

    await user.update(
      {
        first_name: first_name || user.first_name,
        last_name: last_name || user.last_name,
        mobile: mobile || user.mobile,
        email: email || user.email,
        gender: gender || user.gender,
      }
    );

    return Helper.response(
      true,
      "Profile updated successfully",
      user,
      res,
      200
    );

  } catch (error) {
    console.error("error:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.checkToken=async(req,res)=>{

  try {
    
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return Helper.response(false, "Token not provided", {}, res, 200);
    }

    const User=await registered_user.findOne({
      where:{
        token
      }
    })

    if(!User){
      return Helper.response(false, "Token Expired", {}, res, 200);
    }
    return Helper.response(true, "User Exists", User, res, 200);

  } catch (error) {
    console.error("error:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
}

exports.SendOtpcredential = async (req, res) => {
  try {
    const { mobile, email } = req.body;

    // if (!mobile && !email) {
    //   return Helper.response(false, "Mobile or Email is required", {}, res, 400);
    // }

    // -----------------------------
    // Build dynamic search condition
    // -----------------------------
    let whereCondition = {};
   const id=req.users.id
    if (mobile) whereCondition.mobile = mobile;
    if (email) whereCondition.email = email;
  
    console.log(whereCondition);
    console.log(req.body);
    
    // Check user exists
    const user = await registered_user.findOne({
      where: whereCondition
    });

    if(user){
      return Helper.response(false,"User Already Exists",{},res,200)
    }
    // if(!user){
    //   return Helper.response(false,"User Not Found",{},res,200)
    // }
    // -----------------------------
    // Generate & Save OTP
    // -----------------------------
    const otpValue = 1234; // Replace with random OTP if required

    const otps = await Otp.create({
      otp: otpValue,
      mobile: mobile || null,
      email: email || null,
      ip: Helper.getLocalIP(),
      type: "App",
      expiry_time:`'${moment().add(5, "minutes").toDate()}'`,
      created_by: user ? user.id : null
    });

    if (!otps) {
      return Helper.response(false, "Unable to send OTP!", {}, res, 500);
    }

    // await Helper.sendSMS(mobile, otpValue, templateId);

    return Helper.response(
      true,
      "OTP sent successfully",
      {  },
      res,
      200
    );

  } catch (error) {
    console.error("error:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.verifyOtpcredential = async (req, res) => {
  try {
    const { mobile, email, otp } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------
    if (!mobile && !email) {
      return Helper.response(false, "Mobile or Email is required", {}, res, 400);
    }
    if (!otp) {
      return Helper.response(false, "OTP is required", {}, res, 400);
    }
    const id =req.users.id

    // -----------------------------
    // Build dynamic search condition
    // -----------------------------
    let whereCondition = {};
    // if (mobile) whereCondition.mobile = mobile;
    // if (email) whereCondition.email = email;
    if(id)whereCondition.id=id

    const user = await registered_user.findOne({
      where: whereCondition
    });

    // if (!user) {
    //   return Helper.response(false, "User not found", {}, res, 404);
    // }

    // -----------------------------
    // Find OTP record
    // -----------------------------
    let whereCondition1={}
    if(mobile){

      whereCondition1.mobile=mobile
    }
    if(email){

      whereCondition1.email=email
    }
    const otpRecord = await Otp.findOne({
    where: whereCondition1
    });

    if (!otpRecord) {
      return Helper.response(false, "Invalid OTP", {}, res, 400);
    }

    // OTP expired?
    if (new Date() > new Date(otpRecord.expiry_time)) {
      return Helper.response(false, "OTP expired", {}, res, 400);
    }   

    // Mark OTP as used
    await otpRecord.update({ status: false });

    // -----------------------------
    // Update user verification fields
    // -----------------------------
    if (mobile) {
      await user.update({ isMobile_verified: true });
    }

    if (email) {
      await user.update({ isemail_verified: true });
    }

    // -----------------------------
    // Success Response
    // -----------------------------
    return Helper.response(
      true,
      "OTP verified successfully",
      {
        isMobile_verified: user.isMobile_verified || mobile ? true : false,
        isemail_verified: user.isemail_verified || email ? true : false
      },
      res,
      200
    );

  } catch (error) {
    console.error("Verify OTP Error:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};


exports.getappProduct = async (req, res) => {
  try {
    let { categories, diseases, ingredients, price_range,search } = req.body;

    const token = req.headers["authorization"]?.split(" ")[1];
    const registerUser = token
      ? await registered_user.findOne({ where: { token, isDeleted: false } })
      : null;
    const IMG_BASE_URL=process.env.IMG_BASE_URL
    let whereCondition = { status: true, isPublish: true };
    // handle disease filter
    if (diseases && diseases.length > 0) {
      const diseaseConditions = diseases.map((d) => ({
        disease_id: {
          [Op.or]: [
            { [Op.eq]: String(d) },
            { [Op.like]: `${String(d)},%` },
            { [Op.like]: `%,${String(d)},%` },
            { [Op.like]: `%,${String(d)}` },
          ],
        },
      }));

      if (!whereCondition[Op.or]) whereCondition[Op.or] = [];
      whereCondition[Op.or].push(...diseaseConditions);
    }

    // handle ingredient filter
    if (ingredients && ingredients.length > 0) {
      const ingredientConditions = ingredients.map((i) => ({
        ingredient_id: {
          [Op.or]: [
            { [Op.eq]: String(i) },
            { [Op.like]: `${String(i)},%` },
            { [Op.like]: `%,${String(i)},%` },
            { [Op.like]: `%,${String(i)}` },
          ],
        },
      }));

      if (!whereCondition[Op.or]) whereCondition[Op.or] = [];
      whereCondition[Op.or].push(...ingredientConditions);
    }

    // handle category filter
    if (categories && categories.length > 0) {
      whereCondition.category_id = { [Op.in]: categories };
    }
    if (price_range && price_range.length > 0) {
      whereCondition.offer_price = { [Op.between]: price_range };
    }



    const bannerData = await Product.findAll({
      order: [["id", "desc"]],
      raw: true,
      where: {
        status: true,
        isPublish: true,
      },
      attributes:["id","product_name","slug","stock_alert","short_description","product_banner_image","product_meta_title","expiry_date","manufacture_date","total_products"
        ,"product_type","brand_id","tax_id","category_id","ingredient_id","disease_id","hsn","sku","ayu_cash","gst","offer_price","mrp","product_varitions",
        "maximum_qty","minimum_qty","unit"
      ]
    });
    if (bannerData.length == 0) {
      return Helper.response(false, "No Data Found", {}, res, 200);
    }
    const products = await Product.findAll({
      where: whereCondition,
      order: [["id", "ASC"]],
      raw: true,
      attributes:["id","product_name","slug","stock_alert","short_description","product_banner_image","product_meta_title","expiry_date","manufacture_date","total_products"
        ,"product_type","brand_id","tax_id","category_id","ingredient_id","disease_id","hsn","sku","ayu_cash","gst","offer_price","mrp","product_varitions",
        "maximum_qty","minimum_qty","unit","meta_image"]
    });

    if (products.length == 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }

    const finalData = await Promise.all(
      products.map(async (item) => {
        const couponData = item.id
          ? await Coupons.findAll({
              where: {
                product_id: item?.id,
                status: true,
              },
              raw: true,
              order: [["id", "ASC"]],
            })
          : [];

        const ProductGallery = await product_gallery.findAll({
          where: { productId: item.id },
          raw: true,
          order: [["id", "ASC"]],
          status: true,
        });
        const ingredientIds = item.ingredient_id
          ? item.ingredient_id
              .split(",")
              .map((i) => parseInt(i.trim()))
              .filter((i) => !isNaN(i))
          : [];
        const disease_id = item.disease_id
          ? item.disease_id
              .split(",")
              .map((i) => parseInt(i.trim()))
              .filter((i) => !isNaN(i))
          : [];
        const wishlists = registerUser
          ? await wishlist.findOne({
              where: {
                productId: item.id,
                registeruserId: registerUser?.id,
              },
            })
          : null;

          const cartData=await Cart.findOne({
            where:{
              registeruserId:req.users?.id,
              productId:item?.id
            }
          })

        return {
          id:item?.id,
          product_name:item?.product_name,
          mrp:item?.mrp,
          offer_price:item?.offer_price,
          meta_image:`${IMG_BASE_URL}/${item?.meta_image}`??null,
          product_banner_image:`${IMG_BASE_URL}/${item?.product_banner_image}`??null,
          // meta_image:item?.meta_image,
          final_price:item?.final_price,
          rating:item?.rating,
          maximum_qty:item?.maximum_qty,
          // product_gallery: ProductGallery,
          disease: await Diseases.findAll({
            where: {
              id: {
                [Op.in]: disease_id,
              },
            },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),
          ingredient: await ingredient.findAll({
            where: {
              id: {
                [Op.in]: ingredientIds,
              },
            },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),
          category: await Category.findOne({
            where: { id: item?.category_id },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),
          brand: await Brand.findOne({
            where: { id: item?.brand_id },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),
          product_types: await ProductType.findOne({
            where: { id: item?.product_type },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),
          unit_data: item?.unit
            ? await Unit.findOne({
                where: { id: item?.unit },
                raw: true,
                attributes: [
                  [col("id"), "value"],
                  [col("name"), "label"],
                ],
              })
            : null,
          // couponData: couponData ?? [],
          // isWishList:wishlists?true:false
          isWishList: wishlists ? true : false,
          wishlistId: wishlists ? wishlists?.id : 0,
          isCartAdded: cartData  ? true : false,
          cartQuatity: cartData ? cartData?.quantity : 0,
        };
      })
    );
    if(finalData.length==0){
      return Helper.response(false, "No Data Found", [], res, 200);
    }

    if(search){
 
      
      const searchedData= Helper.filterProducts(finalData, search);
      if(searchedData.length==0){
        return Helper.response(false, "No Data Found", [], res, 200);
      }      
      return Helper.response(true,"Data Found Successfully",searchedData, res,200);
    }
      
    return Helper.response(
      true,
      "Data Found Successfully",
      finalData,
      res,
      200
    );
  } catch (error) {
    return Helper.response(false, error?.message, {}, res, 500);
  }
};



exports.AppaddCart = async (req, res) => {
  try {
    const { productId, quantity = 1, status = true } = req.body;

    const token = (req.headers.authorization || "").split(" ")[1];

    const registerUser = token && token !== "null"
      ? await registered_user.findOne({ where: { token } })
      : null;

    let where = { productId };

    const product = await Product.findOne({ where: { id: productId } });
    let price = product?.offer_price || 0;

    if (registerUser) {
      where.registeruserId = registerUser.id;
    } else {
      where.deviceId = req.headers.deviceid;
    }

    const existing = await Cart.findOne({ where });

    if (existing) {
      const newQty = Number(existing.quantity) + Number(quantity);
      const newTotal = Number(price) * newQty;
      // console.log(newQty,"okay---");
      if(newQty > product?.maximum_qty){
        return Helper.response(false, `Maximum quantity limit is ${product?.maximum_qty}`, {}, res, 400);
      }
      if(newQty <=0){
        await existing.destroy();
        return Helper.response(true, "Cart updated", {}, res, 200);
      }

      await existing.update({ quantity: newQty, total: newTotal });

      return Helper.response(true, "Cart updated", existing, res, 200);
    }

    // Correct cart creation
    const cart = await Cart.create({
      productId,
      price,
      quantity,
      total: Number(price) * Number(quantity),
      status,
      // deviceId: registerUser ? null : req.headers.deviceid || null,
      registeruserId: registerUser ? registerUser.id : null,
      createdBy: registerUser ? registerUser.id : null,
    });

    return Helper.response(true, "Cart added", cart, res, 201);

  } catch (err) {
    console.error(err);
    return Helper.response(false, "Error adding cart", err, res, 500);
  }
};

exports.deleteAppCart = async (req, res) => {
  try {
    const { id, productId } = req.body;

    if (!id && !productId) {
      return Helper.response(false, "Id is required", {}, res, 400);
    }
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];

    const token = authHeader?.split(" ")[1];
     let deletedId
   
      const RegisterUser=await registered_user.findOne({
        where:{
         token
        }
      })

      if(RegisterUser){
         deletedId=RegisterUser?.id
      }
    
    if (id == "clear_all") {
   
      deletedId=deletedId==undefined?null:deletedId
         await Cart.destroy({ where: { 
          [Op.or]:{
          registeruserId:deletedId
          }
       
        } });
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
 

    if (id && id !== "clear_all") {
      whereCondition.id = id;
    }

    const cart = await Cart.findOne({ where: whereCondition });

    if (!cart) {
      return Helper.response(false, "cart not found", {}, res, 404);
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



exports.getAllMasterDD = async (req, res) => {
  try {
    // CATEGORY DD
    const categoryData = await Category.findAll({
      where: { status: true,parent_id:0 },
      order: [["order", "ASC"]],
      attributes: [  ["name", "label"],
        ["id", "value"]],
      raw: true,
    });

    // PUBLIC DISEASES DD
    const diseasesData = await Diseases.findAll({
      where: { status: true },
      attributes: [
        ["name", "label"],
        ["id", "value"],
      
      ],
      raw: true,
    });

    // INGREDIENT DD
    const ingredientData = await ingredient.findAll({
      where: { status: true },
      attributes: [["id", "value"], ["name", "label"]],
      order: [["id", "DESC"]],
      raw: true,
    });

    return Helper.response(
      true,
      "All dropdowns fetched successfully",
      {
        category_dd: categoryData,
        diseases_dd: diseasesData,
        ingredient_dd: ingredientData,
      },
      res,
      200
    );  


  } catch (error) {
    console.log("Error in Master Dropdown API:", error);
    return Helper.response(false,error?.message,{},res,500 );  
  }
};


exports.getSubCategory=async(req,res)=>{
  try {
    const {category_id}=req.body
    if(!category_id){
      return Helper.response(false,"Category Id is required",{},res,400)
    }
    const subCategoryData = await Category.findAll({  
      where: { status: true,parent_id:category_id },
      order: [["order", "ASC"]],
      attributes: [  ["name", "label"],
        ["id", "value"]],
      raw: true,
    });
    if(subCategoryData.length==0){
      return Helper.response(false,"No Data Found",{},res,200)
    }
    return Helper.response(true,"Data Found Successfully",subCategoryData,res,200)
  } catch (error) {
    console.log("Error in Sub Category API:", error);
    return Helper.response(false,error?.message,{},res,500 );  
  }
}

// exports.getAppCheckOutCartList = async (req, res) => {
//   try {

//     let whereCondition = { };
//     whereCondition.registeruserId = req.users.id;

//     const carts = await Cart.findAll({
//       where: whereCondition,
//       order: [["id", "DESC"]],
//       attributes: [
//         "id",
//         "productId",
//         "quantity",
//         "price",
//         "total",
//       ],  
//       raw: true,
//     });

//     const AddressList = await Address.findAll({
//       where: {
//         user_id: req.users.id,
//         user_type: "registered_user",
//         type: "shipping",
//       },
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
//           attributes: [
//             "id",
//             "product_name",
//             "offer_price",
//             "mrp",
//             "product_banner_image",
//             "meta_image",
//             "brand_id",
//             "unit",
//           ],
//           order: [["id", "ASC"]],
//           raw: true,
//         });
//         if (!productData || productData.length == 0) return null;
//         console.log(productData,"productDataproductDataproductDataproductData");
//         const IMG_BASE_URL=process.env.IMG_BASE_URL
//         const unitData = productData[0]?.unit ? await Unit.findOne({
//           where: { id: productData[0]?.unit },
//           raw: true,  
//           attributes: [["name", "label"], ["id", "value"]],
//         }):null;
//         const brandData =productData[0]?.brand_id ? await Brand.findOne({
//           where: { id: productData[0]?.brand_id },
//           raw: true,
//           attributes: [["name", "label"], ["id", "value"]],
//         }) :null;
//         return {
//           ...item,
//           quantity: parseFloat(item?.quantity),
//           total: parseFloat(item?.total),
//           price: parseFloat(item?.price),
//           // productData,
//           meta_image:`${IMG_BASE_URL}/${productData[0]?.meta_image}`  || null,
//           offer_price: productData[0]?.offer_price || null,
//           mrp: productData[0]?.mrp || null,
//           ayu_cash: productData[0]?.ayu_cash || null,
//           product_name: productData[0]?.product_name || null,
//           brand_name: brandData?.label || null,
//           // unit: productData[0]?.unit || null,
//           unit:unitData?.label || null,
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
//       // const product = item.productData.find(
//       //   (product) => product.id == item.productId
//       // );
//       return acc + (parseInt(item?.ayu_cash) || 0);
//     }, 0);

//     const responseData = {
//       cart_items: finalData,
//       order_summary: {
//         sub_total: subtotalAmount || 0,
//         // ayu_cash: ayuCash || 0,
//         shipping_charge: totalAmount > 500 ? 0 : 79,
//         coupon_discount: couponData?.max_discount ?? 0,
//         total_amount: totalAmount > 500 ? totalAmount : totalAmount + 79,
//         coupon_id: req.body.coupon_id ? req.body.coupon_id : null,
//       },
//       address_list: AddressList || [],
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


exports.getAppCartList = async (req, res) => {
  try {
   
    const { ayu_cash_apply = true } = req.body;

  
    let whereCondition = {};

   
      whereCondition.registeruserId = req.users.id;
    

    // Fetch cart rows
    const carts = await Cart.findAll({
      where: whereCondition,
      order: [["id", "DESC"]],
      attributes: [
        "id",
        "productId",
        "quantity",
        "price",
        "total",
      ], 
      raw: true,
    });

    if (!carts.length) {
      return Helper.response(false, "No carts found", [], res, 200);
    }

    // =========================================================
    //  MAP CART DATA + FETCH PRODUCT
    // =========================================================
    let finalData = await Promise.all(
      carts.map(async (item) => {
        const productData = await Product.findAll({
          where: { id: item.productId, status: true, isPublish: true },
          raw: true,
           attributes: [
            "id",
            "product_name",
            "offer_price",
            "mrp",
            "product_banner_image",
            "meta_image",
            "brand_id",
            "ayu_cash",
            "unit",
          ],
        });

        if (!productData || productData.length == 0) return null;
        const IMG_BASE_URL=process.env.IMG_BASE_URL
        const unitData = productData[0]?.unit ? await Unit.findOne({
          where: { id: productData[0]?.unit },
          raw: true,  
          attributes: [["name", "label"], ["id", "value"]],
        }):null;
        const brandData =productData[0]?.brand_id ? await Brand.findOne({
          where: { id: productData[0]?.brand_id },
          raw: true,
          attributes: [["name", "label"], ["id", "value"]],
        }) :null;
        return {
          ...item,
          quantity: parseFloat(item?.quantity),
          total: parseFloat(item?.total),
          price: parseFloat(item?.price),
          // productData,
          meta_image:`${IMG_BASE_URL}/${productData[0]?.meta_image}`  || null,
          offer_price: productData[0]?.offer_price || null,
          mrp: productData[0]?.mrp || null,
          ayu_cash: productData[0]?.ayu_cash || null,
          product_name: productData[0]?.product_name || null,
          brand_name: brandData?.label || null,
          brand_id: productData[0]?.brand_id || null,
          // unit: productData[0]?.unit || null,
          unit:unitData?.label || null,
        };
      })
    );

    finalData = finalData.filter((item) => item != null);

    // =====================================
    // Subtotal
    // =====================================
    let subtotalAmount = finalData.reduce((acc, item) => acc + item.total, 0);
    let totalAmount = subtotalAmount;

    let couponData;

    // ===========================================
    // Apply Coupon (your logic maintained)
    // ===========================================
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

    // =====================================
    // AyuCash Calculation
    // =====================================
    const ayuCash = finalData.reduce((acc, item) => {
      // const product = item.productData.find(
      //   (p) => p.id == item.productId
      // );
      return acc + (parseInt(item?.ayu_cash) || 0);
    }, 0);

    // =====================================
    //  Ayushastra Brand check
    // =====================================
    let ayushastraBrandValue = 0;

    for (const item of finalData) {
      // const product = item.productData.find(
      //   (p) => p.id == item.productId && p.status === true
      // );

      const brand = await Brand.findOne({
        where: { id: item?.brand_id },
      });

      if (brand?.name?.toLowerCase() === "ayushsatra") {
        ayushastraBrandValue += parseFloat(item.total) || 0;
      }
    }

  
    let maxRedeemableAyuCash = 0;
    let ayuCashMessage = "";
 const registerUser=await registered_user.findOne({
      where:{
        id:req.users.id
      }
    })
    if (registerUser) {
      if (subtotalAmount >= 500 && ayushastraBrandValue >= 200) {
        maxRedeemableAyuCash = (subtotalAmount * 0.2).toFixed(2);
        if(Number(registerUser?.ayucash_balance) < maxRedeemableAyuCash) {
          totalAmount = ayu_cash_apply ?  totalAmount - Number(registerUser?.ayucash_balance): totalAmount;
         
          ayuCashMessage = `You can redeem up to ₹${totalAmount} AyuCash.`;
        } else { 
        totalAmount = ayu_cash_apply ? totalAmount - maxRedeemableAyuCash : totalAmount;
        ayuCashMessage = `You can redeem up to ₹${maxRedeemableAyuCash} AyuCash.`;
        }
       
      } else {
        if (subtotalAmount < 500) ayuCashMessage = "Cart value must be at least ₹500 to redeem AyuCash.";
        if (ayushastraBrandValue < 200) ayuCashMessage = "You must have at least ₹200 of Ayushastra products to redeem AyuCash.";
      }
    }


    let shippingCharge = totalAmount > 500 ? 0 : 79;
   
    const AddressList = await Address.findAll({ 
      where: {
        user_id: req.users.id,
        is_default: true,
        type: "shipping",
      },
      order: [["id", "DESC"]],
      raw: true,
    });

    const responseData = {
      cart_items: finalData,
      order_summary: {
        sub_total: parseInt(subtotalAmount.toFixed(2)),
        ayu_cash: ayuCash,
        shipping_charge: shippingCharge,
        coupon_discount: couponData?.max_discount ?? 0,
        total_amount: totalAmount + shippingCharge,
        coupon_id: req.body.coupon_id ?? null,
        maxRedeemableAyuCash: registerUser?.ayucash_balance < Number(maxRedeemableAyuCash) ? registerUser?.ayucash_balance :maxRedeemableAyuCash ,
        ayuCashMessage,
        ayu_cash_apply: registerUser ? ayu_cash_apply : null,
      },
      address_list: AddressList || [],
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


exports.AppcheckOut = async (req, res) => {
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
      addressId,
      coupon_id,
      coupon_discount,
      ayu_cash,
      full_name,
      isSaved,
      isBillingSameAsShipping,
      term,
      type,
      isDefault,
      subtotal,
      billing_id,
      shipping_id
    } = req.body;

    const shipping_charge = req.body?.orderSummary?.shipping_charge;

    const maxRedeemableAyuCash = req.body?.orderSummary?.maxRedeemableAyuCash;
    const ayu_cash_apply = req.body?.orderSummary?.ayu_cash_apply;
      console.log(req.body,"Body DATA");
    const today = new Date()
    const month =today.getMonth()+1
    const year =today.getFullYear()
    if (
      !first_name ||
      !last_name ||
      !email ||
      !mobile ||
      // !city ||
    //   !state ||
    //   !country ||
    //   !zip_code ||
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
    console.log(req.body,"body Data");
    

    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];
    const token = authHeader?.split(" ")[1];
    const deviceId = req.headers.deviceid || null;

    const registerUser = token
      ? await registered_user.findOne({ where: { token, isDeleted: false } })
      : null;

    const userModel = registerUser ? registered_user : User;
    const userType = registerUser ? "registered_user" : "user";
    const responseType=registerUser ? "register" : "guest";

    const shippingData = req.body.addresses?.find(a => a.type === "shipping") || {};
    const billingData = req.body.addresses?.find(a => a.type === "billing") || {};
    const summary = req.body.orderSummary || {};

    let user;
    if (type == "gmail") {
      user = await userModel.findOne({ where: { email }, transaction });
    } else {
      user = await userModel.findOne({ where: { mobile }, transaction });
    }
  
    
    if (!user) {
      await transaction.rollback();
      return Helper.response(false, "User not found", {}, res, 404);
    }

    await userModel.update(
      {
        deviceId,
        first_name,
        last_name,
        email,
        mobile,
        alter_mobile,
      },
      { where: { id: user.id }, transaction }
    );

    let shippingAddressId = shipping_id;

if (!shippingAddressId) {
  const shippingAddress = await Address.create(
    {
      user_id: user.id,
      full_name: full_name || first_name + " " + last_name,
      address: shippingData.address,
      apartment: shippingData.apartment,
      city: shippingData.city,
      state: shippingData.state,
      postal_code: shippingData.pin_code,
      mobile: shippingData.mobile,
      user_type: userType,
      isSaved,
      is_default:isDefault??true,
       type:"shipping"
    },
    { transaction }
  );

  shippingAddressId = shippingAddress.id;
}

let billingAddressId = billing_id;

if (!billingAddressId) {
  const billingAddress = await Address.create(
    {
      user_id: user.id,
      full_name: full_name || first_name + " " + last_name,
      address: billingData.address,
      apartment: billingData.apartment,
      city: billingData.city,
      state: billingData.state,
      postal_code: billingData.pin_code,
      mobile: billingData.mobile,
      user_type: userType,
      isSaved,
      is_default:isDefault??true,
      type:"billing",
      is_billing_same_as_shipping:isBillingSameAsShipping
    },
    { transaction }
  );

  billingAddressId = billingAddress.id;
}

    // if (!addressId) {
    //   const createdAddress = await Address.create(
    //     {
    //       user_id: user.id,
    //       full_name,
    //       address,
    //       city,
    //       mobile,
    //       state,
    //       country,
    //       postal_code: zip_code,
    //       user_type: userType,
    //       address_line2: req.body.address_line2 || "",
    //       isSaved,
    //     },
    //     { transaction }
    //   );
    //   shippingAddressId = createdAddress.id;
    // }

    const order = await Order.create(
      {
        user_id: user.id,
        shipping_address_id: shippingAddressId,
        billing_address_id: isBillingSameAsShipping ? shippingAddressId : billingAddressId,
        shipping_address_id: shippingAddressId,
        // billing_address_id: isBillingSameAsShipping
        //   ? shippingAddressId
        //   : shippingAddressId,
        total_amount,
        subtotal: req.body.orderSummary?.sub_total,
        payment_status: payment_method == "COD" ? "pending" : "paid",
        order_status: "placed",
        user_type: userType,
        order_no: await Helper.generateOrderNumber(),
        coupon_id: coupon_id || null,
        ayu_cash: ayu_cash || 0,
        coupon_discount: coupon_discount || 0,
        is_billing_same_as_shipping: isBillingSameAsShipping,
        term: term,
        shipping_cost: shipping_charge,
        ayu_cash_apply: ayu_cash_apply,
        maxRedeemableAyuCash: maxRedeemableAyuCash,
      },
      { transaction }
    );

    if (userModel == "registered_user") {
      await registered_user.increment(
        { monthly_purchase: order.total_amount },
        { where: { id: order.user_id } }
      );
    }

    for (const item of cart_items) {
      const { productId, quantity, price, total } = item;
      if (!productId || !quantity || !price || !total) {
        await transaction.rollback();
        return Helper.response(
          false,
          "Invalid cart item details",
          {},
          res,
          400
        );
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

    if (registerUser) {
      await Cart.destroy({
        where: { registeruserId: registerUser.id },
        transaction,
      });
       const currentBalance = registerUser.ayucash_balance || 0;
      //  const newBalance = currentBalance - Number(summary.maxRedeemableAyuCash || 0);
       const newBalance  =  Math.min(currentBalance, maxRedeemableAyuCash)

      await registered_user.update(
        { ayucash_balance: Number(newBalance.toFixed(2)) },
        { where: { id: registerUser.id }, transaction }
       );

      await UserMonthPoints.create({
           type:'redeemed',
           ayu_points: Number(newBalance.toFixed(2)), 
           year,
           month,
           parent_id:registerUser.id
        })

       
    } else if (deviceId) {
      await Cart.destroy({
        where: { deviceId },
        transaction,
      });
    }

    await transaction.commit();

     let userDetailss = await userModel.findOne({
      where: { mobile },
      raw: true,
    });

    if (userDetailss) {
      userDetailss.type = responseType;
    }
// Fetch all addresses of the user
const addressList = await Address.findAll({
  where: { user_id: userDetailss?.id },
  raw: true,
});

// If no address, return empty array
if (!addressList || addressList.length === 0) {
  formattedAddresses = [];
} else {

  // Grouping by address_type (home/office/etc.)
  const grouped = {};

  for (const addr of addressList) {
    const key = addr.address_type || "default";

    if (!grouped[key]) {
      grouped[key] = { billing: null, shipping: null };
    }

    if (addr.type === "billing") {
      grouped[key].billing = addr;
    }

    if (addr.type === "shipping") {
      grouped[key].shipping = addr;
    }
  }

  // Convert object → array
  var formattedAddresses = Object.values(grouped);
}

userDetailss.address=formattedAddresses

    return Helper.response(
      true,
      "Checkout completed successfully",
      { order_id: order.id, order_no: order?.order_no, user:userDetailss, },
      res,
      200
    );
  } catch (error) {
    console.error("Error in checkout:", error);
    await transaction.rollback();
    return Helper.response(false, error?.errors?.[0]?.message, {}, res, 500);
  }
};


exports.addAppAddress = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user_id = req.users?.id;
    const { address = [], isBillingSameAsShipping = false } = req.body;

    if (!user_id || !address.length) {
      await transaction.rollback();
      return Helper.response(false, "Invalid address", [], res, 400);
    }

    let shippingAddress = address.find(a => a.type === "shipping");
    let billingAddress = address.find(a => a.type === "billing");

    // ❗ If billing same as shipping → clone shipping details
    if (isBillingSameAsShipping) {
      billingAddress = { ...shippingAddress, type: "billing" };
    }

    // ❗ Validate mandatory fields
    const validate = (addr) => 
      addr.full_name && addr.mobile && addr.address &&
      addr.city && addr.state && addr.pin_code;

    if (!validate(shippingAddress)) {
      await transaction.rollback();
      return Helper.response(false, "Shipping address missing fields", [], res, 400);
    }

    if (!validate(billingAddress)) {
      await transaction.rollback();
      return Helper.response(false, "Billing address missing fields", [], res, 400);
    }

    // if any is default → remove previous defaults
    const anyDefault = address.some(a => a?.is_default === true);
    if (anyDefault) {
      await Address.update(
        { is_default: false },
        { where: { user_id, user_type: "registered_user" }, transaction }
      );
    }

    // Save both addresses
    const savedShipping = await Address.create({
      user_id,
      user_type: "registered_user",
      address_type:shippingAddress.address_type,
      full_name: shippingAddress.full_name,
      mobile: shippingAddress?.mobile,
      alter_mobile: shippingAddress?.alter_mobile || null,
      address: shippingAddress.address,
      address_line2: shippingAddress?.apartment,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postal_code: shippingAddress.pin_code,
      country: "India",
      type: shippingAddress.type??"shipping",
      is_default: shippingAddress.is_default || false,
    }, { transaction });

    const savedBilling = await Address.create({
      user_id,
      user_type: "registered_user",
      address_type: shippingAddress.address_type,
      full_name: billingAddress.full_name,
      mobile: billingAddress?.mobile,
      alter_mobile: billingAddress?.alter_mobile || null,
      address: billingAddress.address,
      address_line2: billingAddress?.apartment,
      city: billingAddress.city,
      state: billingAddress.state,
      postal_code: billingAddress.pin_code,
      type: billingAddress.type??"billing",
      country: "India",
      is_default: billingAddress.is_default || false,
    }, { transaction });

    await transaction.commit();

    return Helper.response(
      true,
      "Shipping & Billing addresses saved successfully",
      { shipping: savedShipping, billing: savedBilling },
      res,
      200
    );

  } catch (error) {
    await transaction.rollback();
    console.log("Error adding addresses:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};


exports.getAppAddressList = async (req, res) => {
  try {
    const user_id = req.users?.id;
    if (!user_id) {
      return Helper.response(false, "Invalid user", [], res, 400);
    } 
    const addressList = await Address.findAll({
      where: { user_id,type: "shipping" },
      order: [["id", "DESC"]],
      raw: true,
    });
    if (addressList.length == 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    } 
    return Helper.response(
      true,
      "Data Found Successfully",
      addressList,
      res,
      200
    );
  } catch (error) {
    return Helper.response(false, error?.message, {}, res, 500);
  } 
};

exports.updateAppAddress = async (req, res) => {
  try {
    const user_id = req.users?.id;
    const { id, full_name, mobile, alter_mobile, address, apartment, city, state, pin_code, is_default } = req.body;
    if (!user_id || !id) {
      return Helper.response(false, "Invalid address", {}, res, 400);
    }
    if (is_default) {
      await Address.update(
        { is_default: false },
        { where: { user_id, user_type: "registered_user" } }
      );
    }
    const addressData = await Address.findOne({ where: { id, user_id } });
    if (!addressData) {
      return Helper.response(false, "Address not found", {}, res, 404);
    } 
    await addressData.update({
      full_name: full_name || addressData.full_name,
      mobile: mobile || addressData.mobile,
      alter_mobile: alter_mobile || addressData.alter_mobile,
      address: address || addressData.address,
      address_line2: apartment || addressData.address_line2,
      city: city || addressData.city,
      state: state || addressData.state,
      postal_code: pin_code || addressData.postal_code,
      is_default: is_default !== undefined ? is_default : addressData.is_default,
    });
    return Helper.response(true, "Address updated successfully", addressData, res, 200);
  } catch (error) {
    return Helper.response(false, error?.message, {}, res, 500);
  }
};