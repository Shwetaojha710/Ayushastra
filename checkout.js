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
const coupons = require("../../model/coupon");
const Cart = require("../../model/cart");
const { Op, literal } = require("sequelize");
const referral_master = require("../../model/referral_master");
const UserMonthPoints = require("../../model/user_month_points");
const Doctor = require("../../model/doctor");
const Qualification = require("../../model/qualification");
const DoctorSlot = require("../../model/doctor_slots");

exports.sendOtp = async (req, res) => {
  try {
    const data = req.body;
    const { mobile, type } = req.body;
    if (!mobile || mobile == undefined || mobile == null || mobile == "") {
      return Helper.response(false, "Mobile number is required", {}, res, 200);
    }

    let existsUser;
    if (type == "doctor") {
      existsUser = await Doctor.findOne({
        where: {
          phone: mobile,
          status: true,
        },
      });

      if (!existsUser) {
        return Helper.response(false, "No User Found", {}, res, 200);
      }
    }
    //  else{
    //  existsUser = await User.findOne({
    //   where: {
    //     mobile,
    //     status: true,
    //   },
    // });
    //  }

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
  const t = await sequelize.transaction();
  try {
    const {
      mobile,
      otp,
      deviceToken,
      email,
      first_name,
      last_name,
      type,
      referred_by,
    } = req.body;
    const deviceId = req.headers?.deviceid;

    if (!deviceId)
      return Helper.response(false, "Device Id is required", {}, res, 400);

    if (!mobile || !otp)
      return Helper.response(false, "Mobile and OTP required", {}, res, 200);

    const otpRecord = await Otp.findOne({
      where: { mobile, otp, status: true },
    });

    if (!otpRecord) return Helper.response(false, "Invalid OTP", {}, res, 200);

    if (new Date() > new Date(otpRecord.expiry_time))
      return Helper.response(false, "OTP expired", {}, res, 200);

    await Otp.update({ status: false }, { where: { mobile, otp } });

    if (type == "doctor") {
      let regDoctor = await Doctor.findOne({
        where: {
          phone: mobile,
        },
      });
      let token;
      if (!regDoctor) {
        let findDoctor = await Doctor.create(
          {
            token,
            phone: mobile,
          },
          { transaction: t }
        );

        token = jwt.sign({ id: findDoctor.id }, process.env.SECRET_KEY);
        // await regDoctor.update({ token }, { transaction: t });
        await findDoctor.update({ token }, { transaction: t });

        await t.commit();

        return Helper.response(
          true,
          "Data Found",
          { step: "step1", token },
          res,
          200
        );
      }

      token = jwt.sign({ id: regDoctor.id }, process.env.SECRET_KEY);

      await regDoctor.update({ token }, { transaction: t });

      await t.commit();
      const drExp = await Qualification.count({
        where: {
          doctorId: regDoctor?.id,
        },
      });
      const drslot = await DoctorSlot.count({
        where: {
          doctorId: regDoctor?.id,
        },
      });
      if (drslot) {
        return Helper.response(
          true,
          "OTP verified successfully",
          {
            id: regDoctor.id,
            name: regDoctor.name,
            mobile: regDoctor.phone,
            email: regDoctor.email,
            token,
            step: "completed",
            type: "doctor",
          },
          res,
          200
        );
      } else if (drExp) {
        return Helper.response(
          true,
          "OTP verified successfully",
          {
            id: regDoctor.id,
            name: regDoctor.name,
            mobile: regDoctor.phone,
            email: regDoctor.email,
            token,
            step: "step3",
            type: "doctor",
          },
          res,
          200
        );
      } else {
        return Helper.response(
          true,
          "OTP verified successfully",
          {
            id: regDoctor.id,
            name: regDoctor.name,
            mobile: regDoctor.phone,
            email: regDoctor.email,
            token,
            step: "step2",
            type: "doctor",
          },
          res,
          200
        );
      }
    }

    // if (type == "doctor") {
    //   let regDoctor = await Doctor.findOne({ where: { phone: mobile } });

    //   if (!regDoctor) {
    //     return Helper.response(false, "No Doctor Found", {}, res, 400);
    //   }

    //   const token = jwt.sign({ id: regDoctor.id }, process.env.SECRET_KEY);

    //   await regDoctor.update(
    //     { token },
    //     { transaction: t }
    //   );

    //   await t.commit();

    //   return Helper.response(
    //     true,
    //     "OTP verified successfully",
    //     {
    //       id: regDoctor.id,
    //       name: regDoctor.name,
    //       mobile: regDoctor.phone,
    //       email: regDoctor.email,
    //       token,
    //       type: "doctor",
    //     },
    //     res,
    //     200
    //   );
    // }

    let regUser = await registered_user.findOne({
      where: { mobile, isDeleted: false },
    });

    let isNewUser = false;

    if (!regUser) {
      isNewUser = true;

      let referralCode = Helper.generateReferralCode(first_name || "USR");
      let exists = await registered_user.findOne({
        where: { referral_code: referralCode },
      });
      if (exists)
        referralCode = Helper.generateReferralCode(first_name || "USR");

      const referralMaster = await referral_master.findOne({
        order: [["createdAt", "desc"]],
        transaction: t,
      });

      const newRegisterBonus = Number(referralMaster?.new_register || 500);
      const refereeBonus = Number(referralMaster?.referee_bonus || 250);
      const referrerBonus = Number(referralMaster?.referrer_bonus || 250);

      let referrerUser = null;
      let newUserBalance = newRegisterBonus;

      if (referred_by) {
        referrerUser = await registered_user.findOne({
          where: { referral_code: referred_by, isDeleted: false },
        });

        if (referrerUser) {
          newUserBalance = newRegisterBonus + refereeBonus;
        }
      }

      // Create user
      regUser = await registered_user.create(
        {
          mobile,
          email: email || null,
          first_name: first_name || "",
          last_name: last_name || "",
          password: "",
          confirmPassword: "",
          isDeleted: false,
          device_id: deviceId,
          type: type || "normal",
          referral_code: referralCode,
          referred_by: referrerUser?.id || null,
          ayucash_balance: newUserBalance,
        },
        { transaction: t }
      );

      const month = Helper.getCurrentMonth().split("-")[1];
      const year = Helper.getCurrentMonth().split("-")[0];

      if (referrerUser) {
        await UserMonthPoints.create(
          {
            parent_id: referrerUser.id,
            child_id: regUser.id,
            month,
            year,
            ayu_points: refereeBonus,
          },
          { transaction: t }
        );

        await registered_user.update(
          {
            ayucash_balance:
              (referrerUser.ayucash_balance || 0) + referrerBonus,
          },
          { where: { id: referrerUser.id }, transaction: t }
        );
      } else {
        await UserMonthPoints.create(
          {
            parent_id: regUser.id,
            child_id: null,
            month,
            year,
            ayu_points: newRegisterBonus,
          },
          { transaction: t }
        );
      }
    }

    // -----------------------------------
    // GENERATE TOKEN
    // -----------------------------------
    const token = jwt.sign({ id: regUser.id }, process.env.SECRET_KEY);

    await regUser.update(
      { token, deviceToken: deviceToken || null },
      { transaction: t }
    );

    // -----------------------------------
    // FETCH SAVED ADDRESSES
    // -----------------------------------
    const addressList = await Address.findAll({
      where: {
        user_id: regUser.id,
        isSaved: true,
      },
      raw: true,
    });

    const groupedAddresses = [];

    addressList.forEach((address) => {
      const idx = groupedAddresses.length - 1;

      if (
        groupedAddresses.length > 0 &&
        (!groupedAddresses[idx].billing || !groupedAddresses[idx].shipping)
      ) {
        if (address.type === "billing") groupedAddresses[idx].billing = address;
        if (address.type === "shipping")
          groupedAddresses[idx].shipping = address;
      } else {
        groupedAddresses.push({
          billing: address.type === "billing" ? address : null,
          shipping: address.type === "shipping" ? address : null,
        });
      }
    });

    await t.commit();

    return Helper.response(
      true,
      "OTP verified successfully",
      {
        id: regUser.id,
        first_name: regUser.first_name,
        last_name: regUser.last_name,
        mobile: regUser.mobile,
        email: regUser.email,
        token,
        referral_code: regUser.referral_code,
        ayucash_balance: regUser.ayucash_balance,
        newUser: isNewUser,
        address: groupedAddresses,
        type: "registered",
      },
      res,
      200
    );
  } catch (error) {
    await t.rollback();
    console.error("Error verifying OTP:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

// exports.verifyOtp = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { mobile, otp, deviceToken, email, first_name, last_name, type, referred_by } = req.body;
//     const deviceId = req.headers?.deviceid;

//     if (!deviceId)
//       return Helper.response(false, "Device Id is required", {}, res, 400);

//     if (!mobile || !otp)
//       return Helper.response(false, "Mobile and OTP required", {}, res, 200);

//     const otpRecord = await Otp.findOne({
//       where: { mobile, otp, status: true },
//     });

//     if (!otpRecord)
//       return Helper.response(false, "Invalid OTP", {}, res, 200);

//     if (new Date() > new Date(otpRecord.expiry_time)) {
//       return Helper.response(false, "OTP expired", {}, res, 200);
//     }

//     await Otp.update({ status: false }, { where: { mobile, otp } });

//     if(type=="doctor"){

//          let regDoctor = await Doctor.findOne({
//       where: { phone:mobile },
//     });
//       if(!regDoctor){
//         return Helper.response(false,"No Doctor Found",{},res,400)
//       }
//   const token = jwt.sign({ id: regDoctor.id }, process.env.SECRET_KEY);

//     await regDoctor.update(
//       { token },
//       { transaction: t }
//     );

//     await t.commit();

//     // ---------------------------------------
//     // SUCCESS RESPONSE
//     // ---------------------------------------
//     return Helper.response(
//       true,
//       "OTP verified successfully",
//       {
//         id: regUser.id,
//         first_name: regUser.first_name,
//         last_name: regUser.last_name,
//         mobile: regUser.mobile,
//         email: regUser.email,
//         token,
//         referral_code: regUser.referral_code,
//         ayucash_balance: regUser.ayucash_balance,
//         newUser: isNewUser,
//         address: groupedAddresses,
//         type: "registered",
//       },
//       res,
//       200
//     );

//     }

//     // ------------------------------------
//     // CHECK IF REGISTERED USER EXISTS
//     // ------------------------------------
//     let regUser = await registered_user.findOne({
//       where: { mobile, isDeleted: false },
//     });

//     let isNewUser = false;

//     // ---------------------------------------------------------------
//     // AUTO CREATE REGISTERED USER + REFERRAL CODE + AYU CASH
//     // ---------------------------------------------------------------
//     if (!regUser) {
//       isNewUser = true;

//       // generate referral code
//       let referralCode = Helper.generateReferralCode(first_name || "USR");
//       let exists = await registered_user.findOne({ where: { referral_code: referralCode } });
//       if (exists) referralCode = Helper.generateReferralCode(first_name || "USR");

//       // -------- Referral Master Bonus Logic --------
//       const referralMaster = await referral_master.findOne({
//         order: [["createdAt", "desc"]],
//         transaction: t
//       });

//       const newRegisterBonus = Number(referralMaster?.new_register || 500);
//       const refereeBonus = Number(referralMaster?.referee_bonus || 250);
//       const referrerBonus = Number(referralMaster?.referrer_bonus || 250);

//       let referrerUser = null;
//       let newUserBalance = newRegisterBonus;

//       // ---------- If referred_by code exists ----------
//       if (referred_by) {
//         referrerUser = await registered_user.findOne({
//           where: { referral_code: referred_by, isDeleted: false },
//         });

//         if (referrerUser) {
//           newUserBalance = newRegisterBonus + refereeBonus;
//         }
//       }

//       // ------------ Create NEW USER --------------
//       regUser = await registered_user.create(
//         {
//           mobile,
//           email: email || null,
//           first_name: first_name || "",
//           last_name: last_name || "",
//           password: "",
//           confirmPassword: "",
//           isDeleted: false,
//           device_id: deviceId,
//           type: type || "normal",
//           referral_code: referralCode,
//           referred_by: referrerUser?.id || null,
//           ayucash_balance: newUserBalance,
//         },
//         { transaction: t }
//       );

//       // -------- Insert into user_month_points --------
//       const month = Helper.getCurrentMonth().split("-")[1];
//       const year = Helper.getCurrentMonth().split("-")[0];

//       if (referrerUser) {
//         await UserMonthPoints.create(
//           {
//             parent_id: referrerUser.id,
//             child_id: regUser.id,
//             month,
//             year,
//             ayu_points: refereeBonus, // 250
//           },
//           { transaction: t }
//         );

//         // update referrer ayu cash
//         await registered_user.update(
//           { ayucash_balance: (referrerUser.ayucash_balance || 0) + referrerBonus },
//           { where: { id: referrerUser.id }, transaction: t }
//         );
//       } else {
//         await UserMonthPoints.create(
//           {
//             parent_id: regUser.id,
//             child_id: null,
//             month,
//             year,
//             ayu_points: newRegisterBonus,
//           },
//           { transaction: t }
//         );
//       }
//     }

//     // ------------------------------------------
//     // GENERATE JWT TOKEN FOR REGISTERED USER
//     // ------------------------------------------
//     const token = jwt.sign({ id: regUser.id }, process.env.SECRET_KEY);

//     await regUser.update(
//       { token, deviceToken: deviceToken || null },
//       { transaction: t }
//     );

//     // ---------------------------------------
//     // FETCH USER ADDRESSES
//     // ---------------------------------------
//     const addressList = await Address.findAll({
//       where: {
//         user_id: regUser.id,

//         isSaved: true,
//       },
//       raw: true,
//     });

//     const groupedAddresses = [];

// // Group by same index (order of creation)
// addressList.forEach(address => {
//   const index = groupedAddresses.length - 1;

//   // If last group is missing a type, fill it
//   if (
//     groupedAddresses.length > 0 &&
//     (!groupedAddresses[index].billing || !groupedAddresses[index].shipping)
//   ) {
//     if (address.type === "billing") groupedAddresses[index].billing = address;
//     if (address.type === "shipping") groupedAddresses[index].shipping = address;
//   } else {
//     // Otherwise create a new entry
//     groupedAddresses.push({
//       billing: address.type == "billing" ? address : null,
//       shipping: address.type == "shipping" ? address : null,
//     });
//   }
// });

//     await t.commit();

//     // ---------------------------------------
//     // SUCCESS RESPONSE
//     // ---------------------------------------
//     return Helper.response(
//       true,
//       "OTP verified successfully",
//       {
//         id: regUser.id,
//         first_name: regUser.first_name,
//         last_name: regUser.last_name,
//         mobile: regUser.mobile,
//         email: regUser.email,
//         token,
//         referral_code: regUser.referral_code,
//         ayucash_balance: regUser.ayucash_balance,
//         newUser: isNewUser,
//         address: groupedAddresses,
//         type: "registered",
//       },
//       res,
//       200
//     );

//   } catch (error) {
//     await t.rollback();
//     console.error("Error verifying OTP:", error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

// commented By 26/11/2025
// exports.verifyOtp = async (req, res) => {
//   try {
//     const { mobile, otp, deviceToken, email, first_name, last_name, type } = req.body;
//     const deviceId = req.headers?.deviceid;

//     if (!deviceId)
//       return Helper.response(false, "Device ID is required", {}, res, 400);

//     if (!mobile || !otp)
//       return Helper.response(false, "Mobile and OTP required", {}, res, 200);

//     const otpRecord = await Otp.findOne({
//       where: { mobile, otp, status: true },
//     });

//     if (!otpRecord)
//       return Helper.response(false, "Invalid OTP", {}, res, 200);

//     if (new Date() > new Date(otpRecord.expiry_time)) {
//       return Helper.response(false, "OTP expired", {}, res, 200);
//     }

//     await Otp.update({ status: false }, { where: { mobile, otp } });

//     // ------------------------------------
//     // CHECK IF REGISTERED USER EXISTS
//     // ------------------------------------
//     let regUser = await registered_user.findOne({
//       where: { mobile, isDeleted: false },
//     });

//     // ---------------------------------------------------------------
//     // AUTO-CREATE REGISTERED USER + REFERRAL CODE (THIS IS NEW LOGIC)
//     // ---------------------------------------------------------------
//     if (!regUser) {
//       // generate referral code
//       let referralCode = Helper.generateReferralCode(first_name || "USR");

//       // ensure uniqueness
//       let exists = await registered_user.findOne({
//         where: { referral_code: referralCode }
//       });

//       if (exists) {
//         referralCode = Helper.generateReferralCode(first_name || "USR");
//       }

//       // Create new registered user
//       regUser = await registered_user.create({
//         mobile,
//         email: email || null,
//         first_name: first_name || "",
//         last_name: last_name || "",
//         password: "",
//         confirmPassword: "",
//         isDeleted: false,
//         device_id: deviceId,
//         type: type || "normal",
//         referral_code: referralCode,
//         referred_by: null,
//         ayucash_balance: 0
//       });
//     }

//     // ------------------------------------------
//     // GENERATE JWT TOKEN FOR REGISTERED USER
//     // ------------------------------------------
//     const token = jwt.sign({ id: regUser.id }, process.env.SECRET_KEY);

//     await regUser.update({
//       token,
//       deviceToken: deviceToken || null
//     });

//     // ---------------------------------------
//     // FETCH USER ADDRESSES
//     // ---------------------------------------
//     const addressList = await Address.findAll({
//       where: {
//         user_id: regUser.id,
//         user_type: "registered_user",
//         isSaved: true,
//       },
//       raw: true,
//     });

//     // ---------------------------------------
//     // SUCCESS RESPONSE
//     // ---------------------------------------
//     return Helper.response(
//       true,
//       "OTP verified successfully",
//       {
//         id: regUser.id,
//         first_name: regUser.first_name,
//         last_name: regUser.last_name,
//         mobile: regUser.mobile,
//         email: regUser.email,
//         token,
//         referral_code: regUser.referral_code,
//         address: addressList,
//         type: "registered",
//       },
//       res,
//       200
//     );

//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

// exports.verifyOtp = async (req, res) => {
//   try {
//     const { mobile, otp, deviceToken, email, first_name, last_name, type } = req.body;
//     const deviceId = req.headers?.deviceid;

//     if (!deviceId)
//       return Helper.response(false, "Device ID is required", {}, res, 400);
//     if (!mobile || !otp)
//       return Helper.response(false, "Mobile and OTP required", {}, res, 200);

//     const otpRecord = await Otp.findOne({
//       where: { mobile, otp, status: true },
//     });

//     if (!otpRecord) return Helper.response(false, "Invalid OTP", {}, res, 200);
//     if (new Date() > new Date(otpRecord.expiry_time)) {
//       return Helper.response(false, "OTP expired", {}, res, 200);
//     }

//     await Otp.update({ status: false }, { where: { mobile, otp } });

//     let regUser = await registered_user.findOne({
//       where: { mobile, isDeleted: false },
//     });

//     let user = await User.findOne({ where: { mobile } });

//     // -----------------------------
//     //  CASE 1 — REGISTER FLOW (newly registered user)
//     // -----------------------------
//     if (type == "register" || regUser) {
//       const token = jwt.sign({ id: regUser.id }, process.env.SECRET_KEY);
//       await regUser.update({ deviceToken: deviceToken || null, token });

//       const addressList = await Address.findAll({
//         where: {
//           user_id: regUser.id,
//           user_type: "registered_user",
//           isSaved: true,
//         },
//         raw: true,
//       });

//       return Helper.response(
//         true,
//         "Registration verified & logged in",
//         {
//           id: regUser.id,
//           first_name: regUser.first_name,
//           last_name: regUser.last_name,
//           mobile: regUser.mobile,
//           email: regUser.email,
//           token,
//           address: addressList,
//           type: "register",
//         },
//         res,
//         200
//       );
//     }

//     // -----------------------------
//     //  CASE 2 — NORMAL OTP LOGIN
//     // -----------------------------
//     if (!user) {
//       user = await User.create({
//         first_name: first_name || regUser?.first_name || "",
//         last_name: last_name || regUser?.last_name || "",
//         email: email || regUser?.email || null,
//         mobile,
//         password_hash: regUser?.password || "",
//         deviceId,
//         status: true,
//       });
//     }

//     const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY);
//     await user.update({ deviceToken: deviceToken || null, token });

//     const regUserAddresses = regUser
//       ? await Address.findAll({
//           where: {
//             user_id: regUser.id,
//             user_type: "registered_user",
//             isSaved: true,
//           },
//           raw: true,
//         })
//       : [];

//     const normalUserAddresses = await Address.findAll({
//       where: {
//         user_id: user.id,
//         user_type: { [Op.ne]: "registered_user" },
//         isSaved: true,
//       },
//       raw: true,
//     });

//     const addresses = [...regUserAddresses, ...normalUserAddresses];
//     if (type != "register") {
//       return Helper.response(
//         true,
//         "OTP verified successfully",
//         {
//           id: user.id,
//           first_name: user.first_name,
//           last_name: user.last_name,
//           mobile: user.mobile,
//           email: user.email,

//           address: addresses,
//           type: type,
//         },
//         res,
//         200
//       );
//     } else {
//       return Helper.response(
//         true,
//         "OTP verified successfully",
//         {
//           id: user.id,
//           first_name: user.first_name,
//           last_name: user.last_name,
//           mobile: user.mobile,
//           email: user.email,
//           token,
//           address: addresses,
//           type: type,
//         },
//         res,
//         200
//       );
//     }
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

// commentedBy 24/11/2025
// exports.verifyOtp = async (req, res) => {
//   try {
//     const { mobile, otp, deviceToken, email, first_name, last_name ,type} = req.body;
//     const deviceId = req.headers?.deviceid;

//     if (!deviceId) {
//       return Helper.response(false, "Device ID is required", {}, res, 400);
//     }

//     if (!mobile || !otp) {
//       return Helper.response(false, "Mobile and OTP required", {}, res, 200);
//     }

//     const otpRecord = await Otp.findOne({
//       where: { mobile, otp, status: true },
//     });

//     if (!otpRecord) {
//       return Helper.response(false, "Invalid OTP", {}, res, 200);
//     }

//     if (new Date() > new Date(otpRecord.expiry_time)) {
//       return Helper.response(false, "OTP expired", {}, res, 200);
//     }

//     await Otp.update({ status: false }, { where: { mobile, otp } });

//     let user = await User.findOne({ where: { mobile } });

//     const regUser = await registered_user.findOne({
//       where: { mobile, isDeleted: false },
//     });

//     if (!user) {
//       user = await User.create({
//         first_name: first_name || regUser?.first_name || "",
//         last_name: last_name || regUser?.last_name || "",
//         email: email || regUser?.email || null,
//         mobile,
//         password_hash: regUser?.password || "",
//         deviceId,
//         status: true,
//       });
//     }

//     const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY);
//     await user.update({ deviceToken: deviceToken || null, token });

//     const userData = user.toJSON();

//     // registered_user address
//     let regUserAddresses = regUser
//       ? await Address.findAll({
//           where: {
//             user_id: regUser.id,
//             user_type: "registered_user",
//             isSaved: true,
//           },
//           raw: true,
//         })
//       : [];

//     // normal user address
//     let normalUserAddresses = await Address.findAll({
//       where: {
//         user_id: user.id,
//         user_type: { [Op.ne]: "registered_user" },
//         isSaved: true,
//       },
//       raw: true,
//     });

//     // -----------------------------------------------------
//     //  MERGE ADDRESSES SAFELY
//     // -----------------------------------------------------
//     const addresses = [...regUserAddresses, ...normalUserAddresses];

//     userData.address = addresses;
//     userData.token = token;
//     userData.type = type;

//     return Helper.response(true, "OTP verified successfully", userData, res, 200);
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     return Helper.response(false, error.message, {}, res, 200);
//   }
// };

// exports.verifyOtp = async (req, res) => {
//   try {
//     const { mobile, otp, deviceToken, email, first_name, last_name, type } =
//       req.body;
//     const deviceId = req.headers?.deviceid;

//     if (!deviceId) {
//       return Helper.response(false, "Device ID is required", {}, res, 400);
//     }

//     if (!mobile || !otp) {
//       return Helper.response(
//         false,
//         "Please provide both mobile number and OTP.",
//         {},
//         res,
//         200
//       );
//     }

//     const otpRecord = await Otp.findOne({
//       where: { mobile, otp, status: true },
//     });

//     if (!otpRecord) {
//       return Helper.response(false, "Invalid OTP.", {}, res, 200);
//     }

//     if (new Date() > new Date(otpRecord.expiry_time)) {
//       return Helper.response(false, "OTP expired.", {}, res, 200);
//     }

//     await Otp.update({ status: false }, { where: { mobile, otp } });

//     let user = await User.findOne({ where: { mobile } });
//     let addresses,RegisterAddress;
//     const registerUserAddress = await registered_user.findOne({
//         where: { mobile, isDeleted: false },
//       });
// if(registerUserAddress){

//       RegisterAddress=await Address.findAll({
//        where: {
//         user_id: registerUserAddress.id,
//         isSaved: true,
//         user_type:"registered_user",
//       },
//       raw: true,
//       })
// }

//     if (!user) {
//       const registerUser = await registered_user.findOne({
//         where: { mobile, isDeleted: false },
//       });

//       user = await User.create({
//         first_name: first_name || registerUser?.first_name || "",
//         last_name: last_name || registerUser?.last_name || "",
//         email: email ?? registerUser?.email ?? null,
//         mobile,
//         password_hash: registerUser?.password || "",
//         deviceId,
//         status: true,
//       });

//     }

//     const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY);

//     await user.update({
//       deviceToken: deviceToken || null,
//       token,
//     });

//     const userData = user.toJSON();

//     let Useraddresses = await Address.findAll({
//       where: {
//         user_id: user.id,
//         isSaved: true,
//         user_type: {
//           [Op.ne]: "registered_user",
//         },
//       },
//       raw: true,
//     });
//     if( registerUserAddress || Useraddresses|| registerUserAddress.length >0||Useraddresses.length>0){

//       addresses=[...RegisterAddress,...Useraddresses]
//     }

//     userData.address = addresses;
//     userData.token = token;

//     return Helper.response(
//       true,
//       "OTP verified successfully.",
//       userData,
//       res,
//       200
//     );
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     return Helper.response(false, error.message, {}, res, 200);
//   }
// };

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
//       total_amount,
//       addressId,
//       coupon_id,
//       coupon_discount,
//       ayu_cash,
//       full_name,
//       isSaved,
//       isBillingSameAsShipping,
//       term,
//       type
//     } = req.body;

//     if (
//       !first_name ||
//       !last_name ||
//       !email ||
//       !mobile ||
//       !address ||
//       !city ||
//       !state ||
//       !country ||
//       !zip_code ||
//       !Array.isArray(cart_items) ||
//       cart_items.length === 0 ||
//       !total_amount
//     ) {
//       return Helper.response(
//         false,
//         "Please provide all required fields",
//         {},
//         res,
//         400
//       );
//     }

//     const authHeader =
//       req.headers["authorization"] || req.headers["Authorization"];
//     const token = authHeader?.split(" ")[1];
//     const deviceId = req?.headers?.deviceid || null;

//     const registerUser = token ? await registered_user.findOne({ where: { token, isDeleted: false } }): null;

//     // Determine if user is registered or guest
//     const userModel = registerUser ? registered_user : User;
//     const userType = registerUser ? "registered_user" : "user";

//      let user;
//     if(type=="gmail"){
//      user = await userModel.findOne({ where: { email }, transaction });

//     }
//     else{
//            user = await userModel.findOne({ where: { mobile }, transaction });

//     }

//     if (!user) {
//       await transaction.rollback();
//       return Helper.response(
//         false,
//         "User not found with the provided mobile number",
//         {},
//         res,
//         404
//       );
//     }

//     // Update user information
//     await userModel.update(
//       {
//         deviceId,
//         first_name,
//         last_name,
//         email,
//         mobile,
//         alter_mobile,
//       },
//       { where: { mobile }, transaction }
//     );
//     let createdAddress, order;
//     if (addressId) {
//       order = await Order.create(
//         {
//           user_id: user.id,
//           shipping_address_id: addressId,
//           billing_address_id: addressId,
//           total_amount,
//           subtotal: total_amount,
//           payment_status: "paid",
//           order_status: "placed",
//           user_type: userType,
//           order_no: await Helper.generateOrderNumber(),
//           coupon_id:coupon_id,
//            ayu_cash:ayu_cash,
//            coupon_discount:coupon_discount,
//           is_billing_same_as_shipping:isBillingSameAsShipping
//         },
//         { transaction }
//       );
//     } else {
//       createdAddress = await Address.create(
//         {
//           user_id: user.id,
//           full_name:full_name,
//           address,
//           city,
//           mobile,
//           state,
//           country,
//           postal_code: zip_code,
//           user_type: userType,
//           address_line2: req.body.address_line2 || "",
//           isSaved:isSaved,

//         },
//         { transaction }
//       );
//       // Create order
//       order = await Order.create(
//         {
//           user_id: user.id,
//           shipping_address_id: createdAddress.id,
//           billing_address_id: createdAddress.id,
//           total_amount,
//           subtotal: total_amount,
//           payment_status: "paid",
//           order_status: "placed",
//           user_type: userType,
//           order_no: await Helper.generateOrderNumber(),
//           coupon_id:coupon_id,
//           ayu_cash:ayu_cash,
//           coupon_discount:coupon_discount,
//           isBillingSameAsShipping:isBillingSameAsShipping
//         },
//         { transaction }
//       );
//     }

//     // Create order items
//     for (const item of cart_items) {
//       const { productId, quantity, price, total } = item;
//       if (!productId || !quantity || !price || !total) {
//         await transaction.rollback();
//         return Helper.response(
//           false,
//           "Invalid cart item details",
//           {},
//           res,
//           400
//         );
//       }

//       await OrderItem.create(
//         {
//           order_id: order.id,
//           product_id: productId,
//           quantity,
//           unit_price: price,
//           total,
//         },
//         { transaction }
//       );
//     }

//     // Clear cart
//     if (registerUser) {
//       await Cart.destroy({
//         where: { registeruserId: registerUser.id },
//         transaction,
//       });
//     } else {
//       await Cart.destroy({
//         where: { deviceId },
//         transaction,
//       });
//     }

//     // Commit all transactions
//     await transaction.commit();

//     return Helper.response(
//       true,
//       "Checkout completed successfully",
//       { order_id: order.id },
//       res,
//       200
//     );
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
      shipping_id,
    } = req.body;

    const shipping_charge = req.body?.orderSummary?.shipping_charge;

    const maxRedeemableAyuCash = req.body?.orderSummary?.maxRedeemableAyuCash;
    const ayu_cash_apply = req.body?.orderSummary?.ayu_cash_apply;
    console.log(req.body, "Body DATA");
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    if (
      // !first_name ||
      // !last_name ||
      // !email ||
      // !mobile ||
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
    console.log(req.body, "body Data");

    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    const token = authHeader?.split(" ")[1];
    const deviceId = req.headers.deviceid || null;

    const registerUser = token
      ? await registered_user.findOne({ where: { token, isDeleted: false } })
      : null;

    const userModel = registerUser ? registered_user : User;
    const userType = registerUser ? "registered_user" : "user";
    const responseType = registerUser ? "register" : "guest";

    const shippingData =
      req.body.addresses?.find((a) => a.type === "shipping") || {};
    const billingData =
      req.body.addresses?.find((a) => a.type === "billing") || {};
    const summary = req.body.orderSummary || {};

    let user;
    if (type == "gmail") {
      user = await userModel.findOne({
        where: { email: registerUser?.email },
        transaction,
      });
    } else {
      user = await userModel.findOne({
        where: { mobile: registerUser?.mobile },
        transaction,
      });
    }

    if (!user) {
      await transaction.rollback();
      return Helper.response(false, "User not found", {}, res, 404);
    }
    if (last_name || last_name != "" || first_name || email) {
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
    }
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
          is_default: isDefault ?? true,
          type: "shipping",
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
          is_default: isDefault ?? true,
          type: "billing",
          is_billing_same_as_shipping: isBillingSameAsShipping,
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
        billing_address_id: isBillingSameAsShipping
          ? shippingAddressId
          : billingAddressId,
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
      const newBalance = Math.min(currentBalance, maxRedeemableAyuCash);

      await registered_user.update(
        { ayucash_balance: Number(newBalance.toFixed(2)) },
        { where: { id: registerUser.id }, transaction }
      );

      await UserMonthPoints.create({
        type: "redeemed",
        ayu_points: Number(newBalance.toFixed(2)),
        year,
        month,
        parent_id: registerUser.id,
      });
    } else if (deviceId) {
      await Cart.destroy({
        where: { deviceId },
        transaction,
      });
    }

    await transaction.commit();

    let userDetailss = await userModel.findOne({
      where: { mobile: registerUser?.mobile || user?.mobile },
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

    userDetailss.address = formattedAddresses;

    return Helper.response(
      true,
      "Checkout completed successfully",
      { order_id: order.id, order_no: order?.order_no, user: userDetailss },
      res,
      200
    );
  } catch (error) {
    console.error("Error in checkout:", error);
    if (!transaction.finished) {
      await transaction.rollback();
    }

    return Helper.response(false, error?.errors?.[0]?.message, {}, res, 200);
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

    const data = await Promise.all(
      orders.map(async (item) => {
        let order_item = await OrderItem.findAll({
          where: {
            id: item?.order_id,
          },
          raw: true,
          order: ["id", "desc"],
        });

        const productdata = await Product.findAll({
          where: {
            id: {
              [Op.in]: order_item.map((item) => item.product_id),
            },
          },
        });

        return {
          ...item,
          productData: productdata ?? [],
          OrderItem: order_item ?? [],
        };
      })
    );

    return Helper.response(
      true,
      "Order list fetched successfully",
      data,
      res,
      200
    );
    // return res.status(200).json({
    //   success: true,
    //   message: "Order list fetched successfully",
    //   data: orders,
    // });
  } catch (error) {
    console.error("Order List Error:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.CouponList = async (req, res) => {
  try {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const Coupon = await coupons.findAll({
      order: [["id", "DESC"]],
      raw: true,
      where: {
        status: true,
        [Op.and]: literal(`CAST("end_time" AS timestamp) > '${now}'`),
      },
    });
    if (Coupon.length == 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }
    return Helper.response(
      true,
      "Coupon list fetched successfully",
      Coupon,
      res,
      200
    );
  } catch (error) {
    console.error("Order List Error:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.addIncentive = async (req, res) => {
  try {
    const { userId, month } = req.params;
    const result = await Helper.calculateIncentive(userId, month);
    if (result) {
      return Helper.response(
        true,
        "Incentive Added Successfully",
        result,
        res,
        200
      );
    }
  } catch (error) {
    console.error("Order List Error:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};
