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
const registeredUser = require("../../model/registeredusers");
const { Op, col } = require("sequelize");
const registered_user = require("../../model/registeredusers");
const Cart = require("../../model/cart");
const wishlist = require("../../model/wishlist");
const coupons = require("../../model/coupon");
const Review = require("../../model/review");
const ReviewGallery = require("../../model/review_gallery");
const referral_master = require("../../model/referral_master");
const Partner = require("../../model/partner");
const UserMonthPoints = require("../../model/user_month_points");
const Unit = require("../../model/unit");
const Doctor = require("../../model/doctor");
// exports.UserRegistration = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       email,
//       password,
//       confirmPassword,
//       country,
//       mobile,
//       termsCheck,
//       referred_by,
//     } = req.body;

//     if (
//       !mobile ||
//       !firstName ||
//       !lastName ||
//       !email ||
//       !password ||
//       !confirmPassword ||
//       !termsCheck ||
//       !country
//     ) {
//       return Helper.response(false, "All fields are required", {}, res, 200);
//     }

//     if (password !== confirmPassword) {
//       return Helper.response(false, "Passwords do not match", {}, res, 200);
//     }

//     const deviceId = req?.headers?.deviceid;
//     if (!deviceId) {
//       return Helper.response(false, "Device ID is required", {}, res, 400);
//     }

//     const [ExistsMobile, ExistsEmail] = await Promise.all([
//       registeredUser.count({ where: { mobile, isDeleted: false } }),
//       registeredUser.count({ where: { email, isDeleted: false } }),
//     ]);

//     if (ExistsMobile)
//       return Helper.response(
//         false,
//         "Mobile number already exists",
//         {},
//         res,
//         200
//       );
//     if (ExistsEmail)
//       return Helper.response(false, "Email already exists", {}, res, 200);

//     const hashedPassword = Helper.encryptPassword(password);
//     const hashedConfirmPassword = Helper.encryptPassword(confirmPassword);

//     let referralCode = Helper.generateReferralCode(firstName || "USR");
//     const existingCode = await registeredUser.findOne({
//       where: { referral_code: referralCode },
//     });
//     if (existingCode)
//       referralCode = Helper.generateReferralCode(firstName || "USR");

//     const referralMaster = await referral_master.findOne({
//       order: [["createdAt", "desc"]],
//     });

//     let referrerUser = null;
//     if (referred_by) {
//       referrerUser = await registeredUser.findOne({
//         where: { referral_code: referred_by },
//       });
//     }

//     const newUserBalance = referrerUser
//       ? (parseInt(referralMaster?.new_register) || 0) +
//         (parseInt(referralMaster?.referee_bonus) || 0)
//       : referralMaster?.new_register || 0;

//     const newUser = await registeredUser.create({
//       mobile,
//       first_name: firstName,
//       last_name: lastName,
//       email,
//       country,
//       constent: termsCheck,
//       password: hashedPassword,
//       confirmPassword: hashedConfirmPassword,
//       referral_code: referralCode,
//       referred_by: referrerUser?.id || null,
//       ayucash_balance: newUserBalance,
//       device_id: deviceId,
//     });

//     if (referrerUser) {
//       const updatedReferrerBalance =
//         (parseInt(referrerUser.ayucash_balance) || 0) +
//         (parseInt(referralMaster?.referrer_bonus) || 0);

//       await registeredUser.update(
//         { ayucash_balance: updatedReferrerBalance },
//         { where: { id: referrerUser.id } }
//       );
//     }

//     return Helper.response(
//       true,
//       "User registered successfully",
//       {
//         userId: newUser.id,
//         referral_code: newUser.referral_code,
//         ayucash_balance: newUser.ayucash_balance,
//       },
//       res,
//       200
//     );
//   } catch (error) {
//     console.error("User Registration Error:", error);
//     return Helper.response(
//       false,
//       error?.message || "Server Error",
//       {},
//       res,
//       500
//     );
//   }
// };



// exports.UserRegistration = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const {
//       firstName,
//       lastName,
//       email,
//       password,
//       confirmPassword,
//       country,
//       mobile,
//       termsCheck,
//       referred_by,
//     } = req.body;

   
//     if (
//       !mobile ||
//       !firstName ||
//       !lastName ||
//       !email ||
//       !password ||
//       !confirmPassword ||
//       !termsCheck ||
//       !country
//     ) {
//       await t.rollback();
//       return Helper.response(false, "All fields are required", {}, res, 200);
//     }

//     if (password != confirmPassword) {
//       await t.rollback();
//       return Helper.response(false, "Passwords do not match", {}, res, 200);
//     }

//     const deviceId = req?.headers?.deviceid;
//     if (!deviceId) {
//       await t.rollback();
//       return Helper.response(false, "Device ID is required", {}, res, 400);
//     }

//     const [ExistsMobile, ExistsEmail] = await Promise.all([
//       registeredUser.count({ where: { mobile, isDeleted: false } }),
//       registeredUser.count({ where: { email, isDeleted: false } }),
//     ]);

//     if (ExistsMobile) {
//       await t.rollback();
//       return Helper.response(false, "Mobile number already exists", {}, res, 200);
//     }

//     if (ExistsEmail) {
//       await t.rollback();
//       return Helper.response(false, "Email already exists", {}, res, 200);
//     }

//     let referralCode = Helper.generateReferralCode(firstName || "USR");

//     let codeExists = await registeredUser.findOne({
//       where: { referral_code: referralCode },
//     });

//     if (codeExists) {
//       referralCode = Helper.generateReferralCode(firstName || "USR");
//     }

//     let referrerUser = null;
//     if (referred_by) {
//       referrerUser = await registeredUser.findOne({
//         where: { referral_code: referred_by },
//       });

//       if (!referrerUser) {
//         await t.rollback();
//         return Helper.response(false, "Invalid referral code", {}, res, 200);
//       }
//     }

   
//     const referralMaster = await referral_master.findOne({
//       order: [["createdAt", "desc"]],
//     });

//     const newUserBalance = referrerUser
//       ? (parseInt(referralMaster?.new_register) || 0) +
//         (parseInt(referralMaster?.referee_bonus) || 0)
//       : referralMaster?.new_register || 0;

//     const hashedPassword = Helper.encryptPassword(password);

  
//     const newUser = await registeredUser.create(
//       {
//         mobile,
//         first_name: firstName,
//         last_name: lastName,
//         email,
//         country,
//         constent: termsCheck,
//         password: hashedPassword,
//         confirmPassword: hashedPassword,
//         referral_code: referralCode,
//         referred_by: referrerUser?.id || null,
//         ayucash_balance: newUserBalance,
//         device_id: deviceId,
//       },
//       { transaction: t }
//     );

   
//     if (referrerUser) {
//       await UserMonthPoints.create(
//         {
//           parent_id: referrerUser.id,
//           child_id: newUser.id,
//           month: Helper.getCurrentMonth().split('-')[1],
//           year: Helper.getCurrentMonth().split('-')[0],
//           ayu_points: referrerUser?.referee_bonus ||250,
//         },
//         { transaction: t }
//       );
//     }

  
//     if (referrerUser) {
//       const updatedReferrerBalance =
//         Number(referrerUser.ayucash_balance || 0) +
//         Number(referralMaster?.referrer_bonus || 0);

//       await registeredUser.update(
//         { ayucash_balance: updatedReferrerBalance },
//         { where: { id: referrerUser.id }, transaction: t }
//       );
//     }


//     await t.commit();

//     return Helper.response(
//       true,
//       "User registered successfully",
//       {
//         userId: newUser.id,
//         referral_code: newUser.referral_code,
//         ayucash_balance: newUser.ayucash_balance,
//       },
//       res,
//       200
//     );

//   } catch (error) {
//     console.error("User Registration Error:", error);

//     await t.rollback();

//     return Helper.response(
//       false,
//       error?.message || "Server Error",
//       {},
//       res,
//       500
//     );
//   }
// };


exports.UserRegistration = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      country,
      mobile,
      termsCheck,
      referred_by,
      type
    } = req.body;

    // --------------------------
    //  VALIDATION
    // --------------------------
    if (
      !mobile || !firstName || !lastName || !email ||
      !password || !confirmPassword || !termsCheck || !country
    ) {
      await t.rollback();
      return Helper.response(false, "All fields are required", {}, res, 200);
    }

    if (password !== confirmPassword) {
      await t.rollback();
      return Helper.response(false, "Passwords do not match", {}, res, 200);
    }

    const deviceId = req?.headers?.deviceid;
    if (!deviceId) {
      await t.rollback();
      return Helper.response(false, "Device ID is required", {}, res, 400);
    }

    // Check if email/mobile exists
    const [existsMobile, existsEmail] = await Promise.all([
      registeredUser.count({ where: { mobile, isDeleted: false } }),
      registeredUser.count({ where: { email, isDeleted: false } }),
    ]);

    if (existsMobile) {
      await t.rollback();
      return Helper.response(false, "Mobile number already exists", {}, res, 200);
    }
    if (existsEmail) {
      await t.rollback();
      return Helper.response(false, "Email already exists", {}, res, 200);
    }

    // --------------------------
    //  GENERATE UNIQUE REFERRAL CODE
    // --------------------------
    let referralCode = Helper.generateReferralCode(firstName || "USR");

    let codeExists = await registeredUser.findOne({
      where: { referral_code: referralCode },
    });
    if (codeExists) {
      referralCode = Helper.generateReferralCode(firstName || "USR");
    }

    // --------------------------
    //  CHECK REFERRAL (IF ANY)
    // --------------------------
    let referrerUser = null;

    if (referred_by) {
      referrerUser = await registeredUser.findOne({
        where: { referral_code: referred_by },
        transaction: t
      });

      if (!referrerUser) {
        await t.rollback();
        return Helper.response(false, "Invalid referral code", {}, res, 200);
      }
    }

    const user =await User.findAll({
      where:{
        [Op.or]:{
        email,
        mobile
        }
      },
      raw:true
    })
     if(user.length >0){
      return Helper.response(false,"User Details Already Exists",{},res,400)
     }
    // --------------------------
    //  GET REFERRAL MASTER VALUES
    // --------------------------
    const referralMaster = await referral_master.findOne({
      order: [["createdAt", "desc"]],
      transaction: t
    });

    const newRegisterBonus = Number(referralMaster?.new_register || 500);
    const refereeBonus = Number(referralMaster?.referee_bonus || 250);
    const referrerBonus = Number(referralMaster?.referrer_bonus || 250);

    // --------------------------
    //  CALCULATE NEW USER AYU CASH
    // --------------------------
    let newUserBalance = newRegisterBonus; // default = 500

    if (referrerUser) {
      newUserBalance = newRegisterBonus + refereeBonus; // 500 + 250 = 750
    }

    const hashedPassword = Helper.encryptPassword(password);

    // --------------------------
    //  CREATE NEW USER
    // --------------------------
    const newUser = await registeredUser.create(
      {
        mobile,
        first_name: firstName,
        last_name: lastName,
        email,
        country,
        constent: termsCheck,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        referral_code: referralCode,
        referred_by: referrerUser?.id || null,
        ayucash_balance: newUserBalance,
        device_id: deviceId,
        type
      },
      { transaction: t }
    );

    // --------------------------
    //  INSERT INTO user_month_points
    // --------------------------
    const month = Helper.getCurrentMonth().split("-")[1];
    const year = Helper.getCurrentMonth().split("-")[0];

    if (referrerUser) {
      // CASE 1: REGISTERED WITH REFERRAL
      await UserMonthPoints.create(
        {
          parent_id: referrerUser.id,
          child_id: newUser.id,
          month,
          year,
          ayu_points: refereeBonus, // 250
        },
        { transaction: t }
      );

      // Update referrer AYU balance
      const updatedReferrerBalance =
        Number(referrerUser.ayucash_balance || 0) + referrerBonus;

      await registeredUser.update(
        { ayucash_balance: updatedReferrerBalance },
        { where: { id: referrerUser.id }, transaction: t }
      );
    } 
    else {
      // CASE 2: DIRECT REGISTRATION — ADD SELF BONUS ENTRY
      await UserMonthPoints.create(
        {
          parent_id: newUser.id,
          child_id: null,
          month,
          year,
          ayu_points: newRegisterBonus, // 500
        },
        { transaction: t }
      );
    }

    // --------------------------
    //  COMMIT TRANSACTION
    // --------------------------
    await t.commit();

    return Helper.response(
      true,
      "User registered successfully",
      {
        userId: newUser.id,
        referral_code: newUser.referral_code,
        ayucash_balance: newUser.ayucash_balance,
      },
      res,
      200
    );

  } catch (error) {
    console.error("User Registration Error:", error);
    await t.rollback();
    return Helper.response(false, error?. errors?.[0]?.message || "Server Error", {}, res, 500);
  }
};

exports.Userlogin = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { email, password, type, fullName, image, referred_by } = req.body;

    if (!email) {
      await t.rollback();
      return Helper.response(false, "Email is required", {}, res, 400);
    }

    const trimmedEmail = email.trim();

    let user = await registeredUser.findOne({
      where: { email: trimmedEmail, isDeleted: false },
      transaction: t,
    });

    const referralMaster = await referral_master.findOne({
      order: [["createdAt", "desc"]],
      transaction: t,
    });

    const newRegisterBonus = Number(referralMaster?.new_register || 500); // 500
    const refereeBonus = Number(referralMaster?.referee_bonus || 250);    // 250
    const referrerBonus = Number(referralMaster?.referrer_bonus || 250);  // 250

    let referrerUser = null;

    // ---------------------------
    // CHECK REFERRAL CODE
    // ---------------------------
    if (referred_by) {
      referrerUser = await registeredUser.findOne({
        where: { referral_code: referred_by },
        transaction: t,
      });

      if (!referrerUser) {
        await t.rollback();
        return Helper.response(false, "Invalid referral code", {}, res, 400);
      }
    }

    // -----------------------------------------------------------
    // 1 GMAIL LOGIN FLOW
    // -----------------------------------------------------------
   if (type === "gmail") {
  if (!fullName) {
    await t.rollback();
    return Helper.response(false, "Full Name is required", {}, res, 400);
  }

  let isNewUser = false;

  // CASE A: NEW Gmail User
  if (!user) {
    isNewUser = true;

    const [firstName, ...rest] = fullName.trim().split(" ");
    const lastName = rest.join(" ");

    let referralCode = Helper.generateReferralCode(firstName || "USR");

    let codeExists = await registeredUser.findOne({
      where: { referral_code: referralCode },
    });

    if (codeExists) {
      referralCode = Helper.generateReferralCode(firstName || "USR");
    }

    let emailExists = await registeredUser.findOne({
      where: { email: trimmedEmail },
    });

    if (!emailExists) {
      user = await registeredUser.create(
        {
          email: trimmedEmail,
          type: "gmail",
          first_name: firstName,
          last_name: lastName,
          profile_image: image || null,
          referred_by: referrerUser?.id || null,
          referral_code: referralCode,
          ayucash_balance: referrerUser
            ? newRegisterBonus + refereeBonus
            : newRegisterBonus,
        },
        { transaction: t }
      );
    }

    const [year, month] = Helper.getCurrentMonth().split("-");

    // A1: New Gmail user WITH referral
    if (referrerUser) {
      await UserMonthPoints.create(
        {
          parent_id: referrerUser.id,
          child_id: user.id,
          month,
          year,
          ayu_points: refereeBonus,
        },
        { transaction: t }
      );

      await registeredUser.update(
        {
          ayucash_balance:
            Number(referrerUser.ayucash_balance || 0) + refereeBonus,
        },
        { where: { id: referrerUser.id }, transaction: t }
      );
    } 
    // A2: New Gmail user WITHOUT referral
    else {
      await UserMonthPoints.create(
        {
          parent_id: user.id,
          child_id: null,
          month,
          year,
          ayu_points: newRegisterBonus,
        },
        { transaction: t }
      );
    }
  }

  // CASE B: Existing Gmail user logs in WITH referral (only once)
  else if (user && referrerUser && !user.referred_by) {
    await registeredUser.update(
      { referred_by: referrerUser.id },
      { where: { id: user.id }, transaction: t }
    );

    const [year, month] = Helper.getCurrentMonth().split("-");

    await UserMonthPoints.create(
      {
        parent_id: referrerUser.id,
        child_id: user.id,
        month,
        year,
        ayu_points: refereeBonus,
      },
      { transaction: t }
    );

    await registeredUser.update(
      {
        ayucash_balance:
          Number(user.ayucash_balance || 0) + refereeBonus,
      },
      { where: { id: user.id }, transaction: t }
    );

    await registeredUser.update(
      {
        ayucash_balance:
          Number(referrerUser.ayucash_balance || 0) + refereeBonus,
      },
      { where: { id: referrerUser.id }, transaction: t }
    );
  }

  // -----------------------------------------------------------
  // LOGIN TOKEN
  // -----------------------------------------------------------
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.SECRET_KEY,
    { expiresIn: "7d" }
  );

  await user.update({ token }, { transaction: t });

  await t.commit();

  // -----------------------------------------------------------
  // FETCH ADDRESS
  // -----------------------------------------------------------
  const addressList = await Address.findAll({
    where: { user_id: user.id, user_type: "registered_user" },
    order: [["id", "ASC"]], // important for grouping
    raw:true
  });

  // -----------------------------------------------------------
  // GROUP ADDRESS (billing + shipping pairs)
  // -----------------------------------------------------------
  // function groupAddresses(list) {
  //   const groups = [];

  //   list.forEach(addr => {
  //     let group = groups.find(g => {
  //       return (
  //         (addr.type == "billing" && !g.billing) ||
  //         (addr.type == "shipping" && !g.shipping)
  //       );
  //     });

  //     if (!group) {
  //       group = { billing: null, shipping: null };
  //       groups.push(group);
  //     }

  //     if (addr.type == "billing") group.billing = addr;
  //     if (addr.type == "shipping") group.shipping = addr;
  //   });

  //   return groups;
  // }

  function groupAddresses(addresses) {
  let billing = null;
  let shipping = null;

  const billingAddr = addresses.find(a => a.type == "billing");

  if (billingAddr?.is_billing_same_as_shipping) {
    billing = billingAddr;
    shipping = billingAddr; // SAME OBJECT
  } else {
    // billing = billingAddr;
    // shipping = addresses.find(a => a.type === "shipping") || null;
  }

  return { billing, shipping };
}
  const groupedAddresses = groupAddresses(addressList);

  // -----------------------------------------------------------
  // FINAL RESPONSE
  // -----------------------------------------------------------
  return Helper.response(
    true,
    isNewUser
      ? "Account created & logged in successfully"
      : "Logged in successfully",
    {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      mobile: user.mobile,
      email: user.email,
      token: user.token,
      profile_image: user.profile_image,
      referral_code: user.referral_code,
      ayucash_balance: user.ayucash_balance,
      address: groupedAddresses,  // <<< grouped address output
      type,
      user_type:"user"
    },
    res,
    200
  );
}


    // -----------------------------------------------------------
    // NORMAL LOGIN (EMAIL + PASSWORD)
    // -----------------------------------------------------------
    if (!password) {
      await t.rollback();
      return Helper.response(false, "Password is required", {}, res, 400);
    }

    if (!user) {
      await t.rollback();
      return Helper.response(false, "User does not exist!", {}, res, 404);
    }

    const decryptedPass = Helper.decryptPassword(user.password);
    if (password.trim() !== decryptedPass) {
      await t.rollback();
      return Helper.response(false, "Invalid credentials", {}, res, 401);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    await user.update({ token }, { transaction: t });
    await t.commit();

    const address = await Address.findAll({
      where: { user_id: user.id, user_type: "registered_user" },
      order: [["is_default", "DESC"]],
    });

    return Helper.response(
      true,
      "You have logged in successfully!",
      {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        mobile: user.mobile,
        email: user.email,
        token: user.token,
        profile_image: user.profile_image,
        referral_code: user.referral_code,
        ayucash_balance: user.ayucash_balance,
        address,
      },
      res,
      200
    );

  } catch (error) {
    console.error("User login error:", error);
    await t.rollback();
    return Helper.response(false, error?.errors[0]?.message, {}, res, 500);
  }
};


// exports.Userlogin = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { email, password, type, fullName, image, referred_by } = req.body;

//     if (!email) {
//       await t.rollback();
//       return Helper.response(false, "Email is required", {}, res, 400);
//     }

//     const trimmedEmail = email.trim();

//     let user = await registeredUser.findOne({
//       where: { email: trimmedEmail, isDeleted: false },
//       transaction: t
//     });

//     const referralMaster = await referral_master.findOne({
//       order: [["createdAt", "desc"]],
//       transaction: t
//     });

//     let referrerUser = null;   

//     // ---------------------------
//     // Check Referral Code
//     // ---------------------------
//     if (referred_by) {
//       referrerUser = await registeredUser.findOne({
//         where: { referral_code: referred_by },
//         transaction: t
//       });

//       if (!referrerUser) {
//         await t.rollback();
//         return Helper.response(false, "Invalid referral code", {}, res, 400);
//       }
//     }

//     // -----------------------------------------------------------
//     // 1️⃣ GOOGLE LOGIN FLOW
//     // -----------------------------------------------------------
//     if (type == "gmail") {

//       if (!fullName) {
//         await t.rollback();
//         return Helper.response(false, "Full Name is required", {}, res, 400);
//       }

//       let isNewUser = false;

//       // -----------------------------------------------------------
//       // Case A: NEW Gmail User
//       // -----------------------------------------------------------
//       if (!user) {
//         isNewUser = true;

//         const [firstName, ...rest] = fullName.trim().split(" ");
//         const lastName = rest.join(" ");

//         const newUserBonus = Number(referralMaster?.new_register || 500);
//         const refereeBonus = Number(referralMaster?.referee_bonus || 0);
//         const referrerBonus = Number(referralMaster?.referrer_bonus || 0);
//         let referralCode = Helper.generateReferralCode(firstName || "USR");

//     let codeExists = await registeredUser.findOne({
//       where: { referral_code: referralCode },
//     });

//     if (codeExists) {
//       referralCode = Helper.generateReferralCode(firstName || "USR");
//     }
//         user = await registeredUser.create(
//           {
//             email: trimmedEmail,
//             type: "gmail",
//             first_name: firstName,
//             last_name: lastName,
//             profile_image: image || null,
//             referred_by: referrerUser?.id || null,
//             referral_code:referralCode|| null,
//             ayucash_balance: referrerUser
//               ? newUserBonus + refereeBonus
//               : newUserBonus,
//           },
//           { transaction: t }
//         );

//         // If referral used → Save mapping + give bonuses
//         if (referrerUser) {
//           await UserMonthPoints.create(
//             {
//               parent_id: referrerUser.id,
//               child_id: user.id,
//               month: Helper.getCurrentMonth().split('-')[1],
//               year: Helper.getCurrentMonth().split('-')[0],
//               ayu_points: refereeBonus,
//             },
//             { transaction: t }
//           );

//           const updatedReferrerCash =
//             Number(referrerUser.ayucash_balance || 0) + referrerBonus;

//           await registeredUser.update(
//             { ayucash_balance: updatedReferrerCash },
//             { transaction: t }
//           );
//         }
//       }

//       // -----------------------------------------------------------
//       // Case B: EXISTING Gmail User logs in WITH referral code
//       // -----------------------------------------------------------
//       if (user && !isNewUser && referrerUser && !user.referred_by) {
        
//         // Add referral mapping
//         await registeredUser.update(
//           { referred_by: referrerUser.id },
//           { transaction: t }
//         );

//         const refereeBonus = 250; // your requirement for existing user login
//         const referrerBonus = Number(referralMaster?.referrer_bonus || 0);

//         // Update existing user AYU cash
//         const updatedUserBalance =
//           Number(user.ayucash_balance || 0) + refereeBonus;

//         await registeredUser.update(
//           { ayucash_balance: updatedUserBalance },
//           { transaction: t }
//         );

//         // Save mapping in user_month_points
//         await UserMonthPoints.create(
//           {
//             parent_id: referrerUser.id,
//             child_id: user.id,
//             month: Helper.getCurrentMonth(),
//             ayu_points: refereeBonus,
//           },
//           { transaction: t }
//         );

//         // Add bonus to PARENT (referrer)
//         const updatedReferrerCash =
//           Number(referrerUser.ayucash_balance || 0) + referrerBonus;

//         await referrerUser.update(
//           { ayucash_balance: updatedReferrerCash },
//           { transaction: t }
//         );
//       }

      
//       const token = jwt.sign(
//         { id: user.id, role: user.role },
//         process.env.SECRET_KEY,
//         { expiresIn: "7d" }
//       );

//       await user.update({ token }, { transaction: t });

//       await t.commit();

//       const address = await Address.findAll({
//         where: { user_id: user.id, user_type: "registered_user" },
//       });

//       return Helper.response(
//         true,
//         isNewUser
//           ? "Account created & logged in successfully"
//           : "Logged in successfully",
//         {
//           id: user.id,
//           first_name: user.first_name,
//           last_name: user.last_name,
//           mobile: user.mobile,
//           email: user.email,
//           token: user.token,
//           profile_image: user.profile_image,
//           address,
//           type: "gmail",
//           referral_code: user.referral_code,
//           ayucash_balance: user.ayucash_balance,
//         },
//         res,
//         200
//       );
//     }

//     // -----------------------------------------------------------
//     // 2️⃣ NORMAL LOGIN
//     // -----------------------------------------------------------
//     if (!password) {
//       await t.rollback();
//       return Helper.response(false, "Password is required", {}, res, 400);
//     }

//     if (!user) {
//       await t.rollback();
//       return Helper.response(false, "User does not exist!", {}, res, 404);
//     }

//     const decryptedPassword = Helper.decryptPassword(user.password);
//     if (password.trim() !== decryptedPassword) {
//       await t.rollback();
//       return Helper.response(false, "Invalid credentials", {}, res, 401);
//     }

//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.SECRET_KEY,
//       { expiresIn: "7d" }
//     );

//     await user.update({ token }, { transaction: t });

//     await t.commit();

//     const address = await Address.findAll({
//       where: { user_id: user.id, user_type: "registered_user" },
//       order: [["is_default", "DESC"]],
//     });

//     return Helper.response(
//       true,
//       "You have logged in successfully!",
//       {
//         id: user.id,
//         first_name: user.first_name,
//         last_name: user.last_name,
//         mobile: user.mobile,
//         email: user.email,
//         token: user.token,
//         profile_image: user.profile_image,
//         address,
//         referral_code: user.referral_code,
//         ayucash_balance: user.ayucash_balance,
//       },
//       res,
//       200
//     );

//   } catch (error) {
//     console.error("User login error:", error);
//     await t.rollback();
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };


// exports.Userlogin = async (req, res) => {
//   try {
//     const { email, password, type, fullName, image } = req.body;

//     if (!email) {
//       return Helper.response(false, "Email is required", {}, res, 400);
//     }

//     const trimmedEmail = email.trim();
//     let user = await registeredUser.findOne({
//       where: { email: trimmedEmail, isDeleted: false },
//     });

//     if (type == "gmail") {
//       if (!user) {
//         // Handle safe split of name
//         const [firstName, ...rest] = fullName?.trim()?.split(" ") || [];
//         const lastName = rest.join(" ") || "";

//         user = await registeredUser.create({
//           email: trimmedEmail,
//           type,
//           first_name: firstName,
//           last_name: lastName,
//           profile_image: image || null,
//           ayucash_balance: 500,
//         });
//       }

//       const token = jwt.sign(
//         { id: user.id, role: user.role },
//         process.env.SECRET_KEY,
//         { expiresIn: "7d" }
//       );

//       await user.update({ token });

//       const address = await Address.findAll({
//         where: { user_id: user.id, user_type: "registered_user" },
//       });

//       const responseData = {
//         id: user.id,
//         first_name: user.first_name,
//         last_name: user.last_name,
//         mobile: user.mobile,
//         email: user.email,
//         token: user.token,
//         base_url: process.env.BASE_URL,
//         profile_image: user.profile_image,
//         address,
//         type,
//       };

//       return Helper.response(
//         true,
//         "Logged in successfully",
//         responseData,
//         res,
//         200
//       );
//     }

//     if (!password) {
//       return Helper.response(false, "Password is required", {}, res, 400);
//     }

//     if (!user) {
//       return Helper.response(false, "User not exists!", {}, res, 404);
//     }

//     const decryptedPassword = Helper.decryptPassword(user.password);
//     if (password.trim() !== decryptedPassword) {
//       return Helper.response(false, "Invalid credentials", {}, res, 401);
//     }

//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.SECRET_KEY,
//       { expiresIn: "7d" }
//     );

//     await user.update({ token });

//     const address = await Address.findAll({
//       where: { user_id: user.id, user_type: "registered_user" },
//       order: [["is_default", "DESC"]],
//     });

//     const responseData = {
//       id: user.id,
//       first_name: user.first_name,
//       last_name: user.last_name,
//       mobile: user.mobile,
//       email: user.email,
//       token: user.token,
//       base_url: process.env.BASE_URL,
//       profile_image: user.profile_image,
//       address,
//       referral_code: user?.referral_code,
//       ayu_cash: user?.ayucash_balance ?? 500,
//       become_partner: user?.become_partner ?? false,
//       referral_count: 0,
//     };

//     return Helper.response(
//       true,
//       "You have logged in successfully!",
//       responseData,
//       res,
//       200
//     );
//   } catch (error) {
//     console.error("User login error:", error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

exports.Userlogout = async (req, res) => {
  const userId = req.users && req.users.id;
  if (!userId) {
    return Helper.response(false, "User ID is required.", [], res, 400);
  }

  try {
    const user = await registeredUser.findByPk(userId);
    if (!user) {
      const Users=await User.findByPk(userId)
      if(!Users){
        const deletedr=await Doctor.findByPk(userId)
        if(!deletedr){
          return Helper.response(false, "User not found.", [], res, 404);
        }
      }else{
          // Clear the token from the user record
       await Users.update({ token: null });
      }
      // return Helper.response(false, "User not found.", [], res, 404);
    }else{
// Clear the token from the user record
    await user.update({ token: null });
    }
        
    

    return Helper.response(
      true,
      "You have logged out successfully!",
      [],
      res,
      200
    );
  } catch (err) {
    console.error("Logout error:", err);
    return Helper.response(false, err?.message, [], res, 500);
  }
};

exports.myOrders = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.body;
    const userId = req.users.id;
    if (!userId) {
      return Helper.response(false, "User ID is required", {}, res, 400);
    }

    const offset = (page - 1) * limit;
    let whereCondition = { user_id: userId, user_type: "registered_user" };

    if (search && search.trim() !== "") {
      whereCondition[Op.or] = [
        { order_no: { [Op.like]: `%${search}%` } },
        { order_status: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset: Number(offset),
    });

    // const finalData = await Promise.all(
    //   orders.map(async (order) => {
    //     const orderItems = await OrderItem.findAll({
    //       where: { order_id: order.id },
    //       raw: true,
    //     });

    //     let productNames = await Product.findAll({
    //       where: {
    //         id: orderItems.map((item) => item.product_id),
    //       },
    //       raw: true,
    //       attributes: [
    //         "product_name",

    //         [col("meta_image"), "product_banner_image"],
    //       ],
    //     });
        
    //      productNames = orderItems.map(
    //       (item) => item.Product?.name || "Product"
    //     );
    //     const review = await Review.findAll({
    //       where: {
    //         order_id: order?.id,
    //       },
    //       raw: true,
    //       order: [["created_at", "desc"]],
    //     });

    //     let actions = ["View Details"];
    //     if (order.order_status == "placed") actions.unshift("Write Review");
    //     if (
    //       order.order_status == "processing" ||
    //       order.order_status == "shipped"
    //     )
    //       actions.unshift("Track Order");
    //     if (order.order_status == "cancelled") actions.unshift("Reorder");
    //     // if (order.order_status == "replaced") actions.unshift("Reorder");

    //     return {
    //       id: order.id,
    //       orderId: order.order_no,
    //       ayu_cash_apply: order?.ayu_cash_apply??'NA',
    //       maxRedeemableAyuCash: order?.maxRedeemableAyuCash ?? 0,
    //       date: moment(order.createdAt).format("YYYY-MM-DD"),
    //       products: productNames.slice(0, 5),
    //       status: order.order_status,
    //       items: productNames.length,
    //       total: Number(order.total_amount),
    //       actions,
    //       review: review ?? [],
    //     };
    //   })
    // );

    const finalData = await Promise.all(
  orders.map(async (order) => {

    // 1. Fetch order items
    const orderItems = await OrderItem.findAll({
      where: { order_id: order.id },
      raw: true,
    });

    // Extract product_ids
    const productIds = orderItems.map(i => i.product_id);

    // 2. Fetch products manually
    const products = await Product.findAll({
      where: { id: productIds },
      raw: true,
      attributes: ["id", "product_name", "meta_image", "unit"]
    });

    // extract unit ids (if unit field stores unit_id)
    const unitIds = products.map(p => p.unit).filter(Boolean);

    // 3. Fetch units manually
    const units = await Unit.findAll({
      where: { id: unitIds },
      raw: true,
      attributes: ["id", "name"]
    });

    // convert units to map for fast access
    const unitMap = {};
    units.forEach(u => (unitMap[u.id] = u.name));

    // 4. Merge orderItems + products + units
    const productDetails = orderItems.map(item => {
      const product = products.find(p => p.id == item.product_id);

      return {
        product_name: product?.product_name ?? "NA",
        quantity: item.quantity??0,
        unit: unitMap[product?.unit] ?? "Unit",
        banner: product?.meta_image ?? null,
        product_banner_image: product?.meta_image ?? null
      };
    });

    // 5. Fetch reviews
    const review = await Review.findAll({
      where: { order_id: order.id },
      raw: true,
      order: [["created_at", "desc"]],
    });

    // 6. Action Buttons
    let actions = ["View Details"];
    if (order.order_status === "placed") actions.unshift("Write Review");
    if (["processing", "shipped"].includes(order.order_status))
      actions.unshift("Track Order");
    if (order.order_status === "cancelled") actions.unshift("Reorder");

    // 7. Final response
    return {
      id: order.id,
      orderId: order.order_no,
      date: moment(order.createdAt).format("YYYY-MM-DD"),
      products: productDetails.slice(0, 5),
      items: productDetails.length,
      status: order.order_status,
      ayu_cash_apply: order?.ayu_cash_apply || false,
      maxRedeemableAyuCash: order?.maxRedeemableAyuCash || 0,
      total: Number(order.total_amount),
      actions,
      review
    };
  })
);

    if (finalData.length == 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }
    return Helper.response(
      true,
      "My Orders fetched successfully",
      {
        page: Number(page),
        totalPages: Math.ceil(count / limit),
        totalOrders: count,
        orders: finalData,
      },
      res,
      200
    );
  } catch (error) {
    console.error("myOrders error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.viewAddressDetails = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return Helper.response(false, "Order ID is required", {}, res, 400);
    }

    // Fetch order
    const order = await Order.findOne({
      where: { id },
      raw: true,
    });

    if (!order) {
      return Helper.response(false, "No Order Found", {}, res, 404);
    }

    // Fetch address
    const address = await Address.findOne({
      where: { id: order.billing_address_id },
      raw: true,
    });

    if (!address) {
      return Helper.response(false, "Address not found", {}, res, 404);
    }

    // Fetch order items
    const orderItems = await OrderItem.findAll({
      where: { order_id: order.id },
      raw: true,
    });

    // Build items with product details
    const items = [];
    for (const item of orderItems) {
      const product = await Product.findOne({
        where: { id: item.product_id },
        raw: true,
      });

      items.push({
        name: product?.product_name || "N/A",
        sku: product?.sku || "N/A",
        qty: item?.quantity || 0,
        price: `₹${item?.total || "0.00"}`,
        image: product?.meta_image || null,
      });
    }

    // Calculate totals
    const subtotal = orderItems.reduce(
      (sum, item) => sum + parseFloat(item.total || 0),
      0
    );
    const shipping = 9.99; // static or configurable
    const tax = +(subtotal * 0.08).toFixed(2); // 8% example
    const total = subtotal + shipping + tax;
    const coupon = await coupons.findOne({
      where: {
        id: order?.coupon_id,
      },
    });
    // Final response structure
    const details = {
      paymentMethod: order.payment_method || "Credit Card (**** 7821)",
      shippingMethod: "Standard Shipping (3-5 days)",
      items,
      priceDetails: {
        subtotal: `₹${order?.subtotal}`,
        shipping: order ? `₹${order?.shipping_cost}` : `₹0`,
        tax: `₹${order?.tax}`,
        name: coupon ? `${coupon?.coupon_name}` : 0,
        discount: coupon ? `₹${coupon?.max_discount}` : 0,
        total: `₹${order?.total_amount}`,
        // coupon_id:coupon ? `${coupon?.coupon_id}`: 0,
      },
      shippingAddress: {
        name: `${address?.name || ""}`,
        street: address?.address || "",
        apt: address?.address_line2 || "",
        city: `${address?.city || ""}, ${address?.postal_code || ""}`,
        country: address?.country || "",
        phone: address?.mobile || "",
      },
    };

    return Helper.response(
      true,
      "Order details fetched successfully",
      details,
      res,
      200
    );
  } catch (error) {
    console.error("Address error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.UserAddressDetails = async (req, res) => {
  try {
    const user_id = req.users?.id;

    if (!user_id) {
      return Helper.response(false, "User ID is required", {}, res, 400);
    }

    const addresses = await Address.findAll({
      where: {
        user_id,
        isSaved: true,
      },
      order: [["is_default", "DESC"]],
      raw: true,
    });

    if (!addresses.length) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }

    // ---------- FORMATTER ----------
    const formatAddress = (item) => ({
      id: item.id,
      full_name: item.full_name,
      mobile: item.mobile,
      address: item.address,
      address_line2: item.address_line2,
      city: item.city,
      state: item.state,
      postal_code: item.postal_code,
      country: item.country,
      is_default: item.is_default,
      contact: {
        name: item.full_name,
        phone: item.mobile,
      },
    });

    // ---------- GROUP BY address_type (HOME / OFFICE) ----------
    const grouped = {};

    for (const addr of addresses) {
      const key = addr.address_type || "HOME";

      if (!grouped[key]) {
        grouped[key] = {
          address_type: key,
          billing: null,
          shipping: null,
          isBillingSameAsShipping: false,
        };
      }

      if (addr.type === "billing") {
        grouped[key].billing = formatAddress(addr);
        grouped[key].isBillingSameAsShipping =
          addr.is_billing_same_as_shipping === true;
      }

      if (addr.type === "shipping") {
        grouped[key].shipping = formatAddress(addr);
      }
    }

    // ---------- HANDLE billing = shipping ----------
    Object.values(grouped).forEach(group => {
      if (
        group.isBillingSameAsShipping === true &&
        group.billing &&
        !group.shipping
      ) {
        group.shipping = { ...group.billing };
      }
    });

    return Helper.response(
      true,
      "Address fetched successfully",
      Object.values(grouped),
      res,
      200
    );
  } catch (error) {
    console.error("Address error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};


// exports.UserAddressDetails = async (req, res) => {
//   try {
//     const { id } = req.users;

//     if (!id) {
//       return Helper.response(false, "ID is required", {}, res, 400);
//     }

//     const addresses = await Address.findAll({
//       where: {
//         user_id: id,
//         isSaved: true,
//       },
//       raw: true,
//       order: [["is_default", "DESC"]],
//     });

//     if (!addresses || addresses.length === 0) {
//       return Helper.response(false, "No Data Found", {}, res, 200);
//     }

//     // ---------- FORMATTER ----------
//     const formatAddress = (item) => ({
//       id: item.id,
//       full_name: item.full_name,
//       mobile: item.mobile,
//       address: item.address,
//       address_line2: item.address_line2,
//       city: item.city,
//       state: item.state,
//       postal_code: item.postal_code,
//       country: item.country,
//       is_default: item.is_default,
//       contact: {
//         name: item.full_name,
//         phone: item.mobile,
//       },
//     });

//     // Index addresses by ID (for shipping_id lookup)
//     const addressById = {};
//     addresses.forEach((a) => {
//       addressById[a.id] = formatAddress(a);
//     });

//     const response = [];

//     // ---------- HOME ----------
//     const homeAddress = addresses.find(a => a.type === "HOME");
//     if (homeAddress) {
//       response.push({
//         address_type: homeAddress.address_type || "HOME",
//         billing: {},
//         shipping: {},
//       });
//     }

//     // ---------- BILLING + SHIPPING ----------
//     const billingAddress = addresses.find(a => a.type == "billing");

//     if (billingAddress) {
//       let shippingAddress = {};

//       if (billingAddress.is_billing_same_as_shipping) {
//         shippingAddress = formatAddress(billingAddress);
//       } else if (billingAddress.shipping_id) {
//         shippingAddress = addressById[billingAddress.shipping_id] || {};
//       }

//       response.push({
//         address_type: billingAddress.address_type || "billing",
//         billing: formatAddress(billingAddress),
//         shipping: shippingAddress,
//         isBillingSameAsShipping: billingAddress?.is_billing_same_as_shipping
//       });
//     }

//     return Helper.response(
//       true,
//       "Address fetched successfully",
//       response,
//       res,
//       200
//     );
//   } catch (error) {
//     console.error("Address error:", error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

// exports.UserAddressDetails = async (req, res) => {
//   try {
//     const { id } = req.users;

//     if (!id) {
//       return Helper.response(false, "ID is required", {}, res, 400);
//     }

    
//     const addresses = await Address.findAll({
//       where: {
//         user_id: id,
//         isSaved: true,
//       },
//       raw: true,
//       order: [["is_default", "DESC"]],
//     });

//     if (!addresses || addresses.length === 0) {
//       return Helper.response(false, "No Data Found", {}, res, 200);
//     }

//     // ---------- FORMAT DATA ----------
//     const responseData = {
//       home: [],
//       billing: {
//         shipping: [],
//       },
//     };

//     addresses.forEach((item) => {
//       const formattedAddress = {
//         ...item,
//         contact: {
//           name: item.full_name,
//           phone: item.mobile ?? "",
//         },
//       };

//       if (item.type === "home") {
//         responseData.home.push(formattedAddress);
//       }

//       if (item.type === "billing" && item.shipping_type === "shipping") {
//         responseData.billing.shipping.push(formattedAddress);
//       }
//     });

//     return Helper.response(
//       true,
//       "Address fetched successfully",
//       responseData,
//       res,
//       200
//     );

//     // // Fetch address
//     // const address = await Address.findAll({
//     //   where: { user_id: id,isSaved:true},
//     //   raw: true,
//     //   order: [["is_default", "DESC"]],
//     // });

//     // if (!address) {
//     //   return Helper.response(false, "Address not found", {}, res, 404);
//     // }

//     // const finalData = await Promise.all(
//     //   address.map(async (item) => {
//     //     // const data = await registered_user.findOne({
//     //     //   where: {
//     //     //     id: item?.user_id,
//     //     //     isDeleted:false
//     //     //   },
//     //     // });

//     //     return {
//     //       ...item,
//     //       contact: {
//     //         name: `${item?.full_name}`,
//     //         phone: item?.mobile ?? 0,
//     //       },
//     //     };
//     //   })
//     // );

//     // if (finalData.length == 0) {
//     //   return Helper.response(false, "No Data Found", [], res, 200);
//     // }

//     // return Helper.response(
//     //   true,
//     //   "Address fetched successfully",
//     //   finalData,
//     //   res,
//     //   200
//     // );
//   } catch (error) {
//     console.error("Address error:", error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

exports.UpdateProfile = async (req, res) => {
  try {
    const {
      id,
      first_name,
      last_name,
      email,
      mobile,
      old_password,
      new_password,
      new_confirmPassword,
    } = req.body;

    if (!id || id == undefined) {
      return Helper.response(false, "User ID is required", [], res, 400);
    }

    const RegisterUser = await registered_user.findByPk(id);
    if (!RegisterUser) {
      return Helper.response(false, "User not found", [], res, 404);
    }

    if (req.files && req.files.length > 0) {
      if (RegisterUser.profile_image) {
        Helper.deleteFile(RegisterUser.profile_image);
      }
      const file = req.files[0];
      RegisterUser.profile_image = file.filename;
    }

    RegisterUser.first_name = first_name || RegisterUser.first_name;
    RegisterUser.last_name = last_name || RegisterUser.last_name;
    RegisterUser.email = email || RegisterUser.email;
    RegisterUser.mobile = mobile || RegisterUser.mobile;


    if (new_password || new_confirmPassword) {
  if (!old_password) {
    return Helper.response(false, "Old password is required", [], res, 400);
  }

  const currentPassword = Helper.decryptPassword(RegisterUser.password);
  if (currentPassword !== old_password) {
    return Helper.response(false, "Old password is incorrect", [], res, 400);
  }

  if (new_password !== new_confirmPassword) {
    return Helper.response(false, "New passwords do not match", [], res, 400);
  }

  const hashedPassword = Helper.encryptPassword(new_password);
  RegisterUser.password = hashedPassword;
  RegisterUser.confirmPassword = hashedPassword;
}


    // if (new_password || new_confirmPassword) {
    //   if (!old_password) {
    //     return Helper.response(false, "Old password is required", [], res, 400);
    //   }
    //     const hashed_old_Password = Helper.encryptPassword(old_password);
    //   const isMatch = await Helper.comparePassword(
    //     hashed_old_Password,
    //     RegisterUser.password
    //   );
    //   if (!isMatch) {
    //     return Helper.response(false, "Old password is incorrect", [], res, 400);
    //   }

    //   if (new_password !== new_confirmPassword) {
    //     return Helper.response(
    //       false,
    //       "New passwords do not match",
    //       [],
    //       res,
    //       400
    //     );
    //   }

    //   const hashedPassword = Helper.encryptPassword(new_password);
    //   RegisterUser.password = hashedPassword;
    //   RegisterUser.confirmPassword = hashedPassword;
    // }

    RegisterUser.updatedAt = new Date();

    await RegisterUser.save();

    return Helper.response(
      true,
      "Profile updated successfully",
      RegisterUser,
      res,
      200
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
    Helper.deleteUploadedFiles(req.files);
    return Helper.response(false, error.message, null, res, 500);
  }
};

exports.deleteAccount = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.users;

    if (!id) {
      await transaction.rollback();
      return Helper.response(false, "ID is required", [], res, 400);
    }

    const user = await registered_user.findByPk(id);
    if (!user) {
      await transaction.rollback();
      return Helper.response(false, "User not found", [], res, 404);
    }

    await registered_user.update(
      { isDeleted: true },
      { where: { id }, transaction }
    );

    await Cart.destroy({ where: { registeruserId: id }, transaction });

    await wishlist.destroy({ where: { registeruserId: id }, transaction });

    await transaction.commit();

    return Helper.response(true, "Account deleted successfully", {}, res, 200);
  } catch (error) {
    // Rollback transaction in case of any error
    await transaction.rollback();
    console.error("Error deleting account:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.updateAddress = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user_id = req.users?.id;

    const {
      addresses,
      isBillingSameAsShipping = false,
      isSaved = true,
      address_type,
      shipping_id,
      billing_id,
      is_default
    } = req.body;

      if (!user_id ) {
      await transaction.rollback();
      return Helper.response(false, "Invalid payload", [], res, 400);
    }
  

     // Reset default only for SAME TYPE
      if (is_default == true) {
         await Address.update(
          { is_default:false},
          {
            where: { user_id },
            transaction,
          }
        );
        await Address.update(
          { is_default},
          {
            where: { user_id, address_type },
            transaction,
          }
        );
         await transaction.commit();
        return Helper.response(true,"Data Updated Successfully",{},res,200)
      }

    // if (!user_id || !Array.isArray(addresses) || addresses.length === 0) {
    //   await transaction.rollback();
    //   return Helper.response(false, "Invalid payload", [], res, 400);
    // }

    const updatedAddresses = [];

    //  If billing same as shipping → clone shipping
    let finalAddresses = addresses;

    if (isBillingSameAsShipping === true) {
      const shipping = addresses.find(a => a.type === "shipping");

      if (!shipping || !shipping_id) {
        await transaction.rollback();
        return Helper.response(
          false,
          "Shipping address required",
          [],
          res,
          400
        );
      }

      finalAddresses = [
        { ...shipping, type: "shipping", id: shipping_id },
        { ...shipping, type: "billing", id: billing_id || shipping_id },
      ];
    }

    for (const item of finalAddresses) {
      const {
        id,
        type,
        full_name,
        mobile,
        address,
        apartment,
        city,
        state,
        postal_code,
        country = "India",
        is_default = false,
      } = item;

      if (!id || !type) {
        await transaction.rollback();
        return Helper.response(
          false,
          "Address id and type required",
          [],
          res,
          400
        );
      }

      const existingAddress = await Address.findOne({
        where: { id, user_id, type },
        transaction,
      });

      if (!existingAddress) {
        await transaction.rollback();
        return Helper.response(false, "Address not found", [], res, 404);
      }

   

      await existingAddress.update(
        {
          full_name,
          mobile,
          address,
          address_line2: apartment,
          city,
          state,
          postal_code,
          country,
          is_default,
          address_type,
          isSaved,
          is_billing_same_as_shipping: isBillingSameAsShipping,
        },
        { transaction }
      );

      updatedAddresses.push(existingAddress);
    }

    await transaction.commit();

    return Helper.response(
      true,
      "Address updated successfully",
      updatedAddresses,
      res,
      200
    );
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating address:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};


// exports.updateAddress = async (req, res) => {
//   const transaction = await sequelize.transaction();
//   try {
//     const {
//       id,

//       full_name,
//       mobile,
//       address,
//       address_line2,
//       city,
//       state,
//       postal_code,
//       country,
//       address_type,
//       is_default,
//     } = req.body;
//     const user_id = req.users?.id;
//     // Validate
//     if (!id) {
//       await transaction.rollback();
//       return Helper.response(false, "Address ID are required", [], res, 400);
//     }

//     // Check if address exists
//     const existingAddress = await Address.findOne({
//       where: { id, user_id },
//       transaction,
//     });
//     if (!existingAddress) {
//       await transaction.rollback();
//       return Helper.response(false, "Address not found", [], res, 404);
//     }

//     // If new address is set as default, reset other addresses for the same user
//     if (is_default == true) {
//       await Address.update(
//         { is_default: false },
//         { where: { user_id }, transaction }
//       );
//     }

//     // Update address fields
//     existingAddress.full_name = full_name || existingAddress.full_name;
//     existingAddress.mobile = mobile || existingAddress.mobile;
//     existingAddress.address = address || existingAddress.address;
//     existingAddress.address_line2 =
//       address_line2 || existingAddress.address_line2;
//     existingAddress.city = city || existingAddress.city;
//     existingAddress.state = state || existingAddress.state;
//     existingAddress.postal_code = postal_code || existingAddress.postal_code;
//     existingAddress.country = country || existingAddress.country;
//     existingAddress.address_type = address_type || existingAddress.address_type;
//     existingAddress.is_default =
//       is_default !== undefined ? is_default : existingAddress.is_default;

//     await existingAddress.save({ transaction });

//     await transaction.commit();

//     return Helper.response(
//       true,
//       "Address updated successfully",
//       existingAddress,
//       res,
//       200
//     );
//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error updating address:", error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

exports.addAddress = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user_id = req.users?.id;

    const {
      addresses,
      isBillingSameAsShipping = false,
      isSaved = true,
      address_type
    } = req.body;

    if (!user_id || !Array.isArray(addresses) || addresses.length === 0) {
      await transaction.rollback();
      return Helper.response(
        false,
        "Invalid address payload",
        [],
        res,
        400
      );
    }
 

    const userAddExists=await Address.findOne({
      where:{
        user_id,
        address_type
      }
    })
    if(userAddExists){
       return Helper.response(false,"CHANGE Address type",{},res,200)
    }

    const createdAddresses = [];

    // 🔹 If billing same as shipping, keep only shipping
    let finalAddresses = addresses;

    if (isBillingSameAsShipping === true) {
      const shippingAddress = addresses.find(a => a.type === "shipping");

      if (!shippingAddress) {
        await transaction.rollback();
        return Helper.response(
          false,
          "Shipping address required when billing is same as shipping",
          [],
          res,
          400
        );
      }

      finalAddresses = [
        { ...shippingAddress, type: "shipping" },
        { ...shippingAddress, type: "billing" },
      ];
    }

    for (const item of finalAddresses) {
      const {
        type, // shipping / billing
        full_name,
        mobile,
        address,
        apartment,
        city,
        state,
        postal_code,
        country = "India",
        is_default = false,
      } = item;

      if (
        !type ||
        !full_name ||
        !mobile ||
        !address ||
        !city ||
        !state ||
        !postal_code
      ) {
        await transaction.rollback();
        return Helper.response(
          false,
          "Missing required address fields",
          [],
          res,
          400
        );
      }

      // 🔹 Reset default for same type
      if (is_default === true) {
        await Address.update(
          { is_default: false },
          {
            where: {
              user_id,
              type,
              user_type: "registered_user",
            },
            transaction,
          }
        );
      }

      const newAddress = await Address.create(
        {
          user_id,
          full_name,
          mobile,
          address,
          address_line2: apartment || null,
          city,
          state,
          postal_code,
          country,
          is_default,
          type,
          address_type,
          user_type: "registered_user",
          isSaved,
          is_billing_same_as_shipping: isBillingSameAsShipping,
        },
        { transaction }
      );

      createdAddresses.push(newAddress);
    }

    await transaction.commit();

    return Helper.response(
      true,
      "Addresses added successfully",
      createdAddresses,
      res,
      200
    );
  } catch (error) {
    await transaction.rollback();
    console.error("Error adding address:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};


// exports.addAddress = async (req, res) => {
//   const transaction = await sequelize.transaction();
//   try {
//     const {
//       full_name,
//       mobile,
//       address,
//       address_line2,
//       city,
//       state,
//       postal_code,
//       country = "India",
//       address_type,
//       is_default = false,
//     } = req.body;

//     const user_id = req.users?.id;
//     if (
//       !user_id ||
//       !full_name ||
//       !mobile ||
//       !address ||
//       !city ||
//       !state ||
//       !postal_code
//     ) {
//       await transaction.rollback();
//       return Helper.response(
//         false,
//         "Please provide all required fields",
//         [],
//         res,
//         400
//       );
//     }

//     if (is_default === true) {
//       await Address.update(
//         { is_default: false },
//         { where: { user_id, user_type: "registered_user" }, transaction }
//       );
//     }

//     const newAddress = await Address.create(
//       {
//         user_id,
//         full_name,
//         mobile,
//         address,
//         address_line2,
//         city,
//         state,
//         postal_code,
//         country,
//         address_type,
//         is_default,
//         user_type: "registered_user",
//       },
//       { transaction }
//     );

//     await transaction.commit();

//     return Helper.response(
//       true,
//       "Address added successfully",
//       newAddress,
//       res,
//       200
//     );
//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error adding address:", error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.body;
      const user_id = req.users?.id;
      const {address_type}=req.body
    // if(!id){
    //   return Helper.response(false,"Id Is Required",{},res,400)
    // }
    if(!address_type){
      return Helper.response(false,"address_type Is Required",{},res,400)
    }
     const DeleteAddress = await Address.destroy({
      where: {
        user_id,address_type
      },
    });
    // const DeleteAddress = await Address.destroy({
    //   where: {
    //     id,
    //     user_type: "registered_user",
    //   },
    // });
    return Helper.response(
      true,
      "Address Deleted Successfully",
      DeleteAddress,
      res,
      200
    );
  } catch (error) {
    await transaction.rollback();
    console.error("Error adding address:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.addReview = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { comments, rating, orderId, status = "pending" } = req.body;

    const user_id = req.users?.id;
    if (!user_id || !comments || !orderId || !rating) {
      await transaction.rollback();
      return Helper.response(
        false,
        "Please provide all required fields",
        [],
        res,
        400
      );
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return Helper.response(false, "No files uploaded", null, res, 400);
    }

    const newAddress = await Review.create(
      {
        userId: user_id,
        comments,
        orderId: orderId,
        rating,
        status,
      },
      { transaction }
    );

    const createdDocs = [];

    for (const file of req.files) {
      const newDoc = await ReviewGallery.create({
        doc_type: file.mimetype,
        reviewId: newAddress?.id,
        image: file.filename,
        created_by: req.users?.id,
        updated_by: req.users?.id,
        status: status || true,
      });
      createdDocs.push(newDoc);
    }
    await transaction.commit();

    return Helper.response(
      true,
      "Review added successfully",
      newAddress,
      res,
      200
    );
  } catch (error) {
    await transaction.rollback();
    console.error("Error adding Review:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.getReview = async (req, res) => {
  try {
    const getReview = await Review.findAll({
      raw: true,
      order: [["createdAt", "desc"]],
    });
    if (getReview.length == 0) {
      return Helper.response(false, "No data Found", [], res, 200);
    }
    return Helper.response(
      true,
      "Review added successfully",
      getReview,
      res,
      200
    );
  } catch (error) {
    console.error("Error adding Review:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findAll({
      order: [["createdAt", "desc"]],
      raw: true,
      attributes: [
        "first_name",
        "last_name",
        "email",
        "mobile",
        "status",
        "createdAt",
        "profile_image",
      ],
    });

    if (user.length == 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }
    return Helper.response(true, "Data Found Successfully", user, res, 200);
  } catch (error) {
    console.error("Error adding Review:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};
exports.updateUserStatus = async (req, res) => {
  try {
    const {id,status}=req.body
    if(!id){
      return Helper.response(false,"Id is required",{},res,200)
    }
    const user =await User.findOne({
      where:{
        id
      }
    })

    if (!user) {
      return Helper.response(false, "No User Found", [], res, 200);
    }
await User.update(
  { status },
  { where: { id } }
);
    return Helper.response(true, "Data Found Successfully", user, res, 200);
  } catch (error) {
    console.error("Error adding Review:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.getRegisteredUser = async (req, res) => {
  try {
    const user = await registered_user.findAll({
      order: [["createdAt", "desc"]],
      raw: true,
    });

    if (user.length == 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }

    const finalData=await Promise.all(
      user.map(async (item)=>{
        const user= await registeredUser.findOne({
          where:{
            id:item?.referred_by
          }
        })
        return {
          ...item,
          referred_by: user ? `${user?.first_name} ${user?.last_name}`:null
        }
      })
    )

    return Helper.response(true, "Data Found Successfully", finalData, res, 200);
  } catch (error) {
    console.error("Error adding Review:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};


exports.updateRegisteredUser=async(req,res)=>{
  try {
    
    const {id,status}=req.body

    if(!id){
      return Helper.response(false,"Id is required",{},res,400)
    }
    const regdata=await registered_user.findOne({
      where:{
         id
      },
      rar:true
    })
    if(!regdata){
      return Helper.response(false,"No user Found",{},res,404)
    }
    const updatereguser=await registered_user.update({
        status
    },{
      where:{
        id
      }
    })
    
    return Helper.response(true,"Data Updated Successfully",{},res,200)


  } catch (error) {
    console.error("Error adding Review:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
}