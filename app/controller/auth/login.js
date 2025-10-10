const sequelize = require("../../connection/connection");
const CryptoJS = require("crypto-js");
const Helper=require('../../helper/helper.js')
const jwt = require("jsonwebtoken");
const admin =require('../../../model/admin.js')
require("dotenv").config();
const { Op } = require("sequelize");

const moment = require("moment");

const axios = require("axios");

exports.userRegister=async(req,res) => {
    // const existingTenant = await admin.findOne({ where: { companyCode: 'DEMOTESTING' } });

    // if (!existingTenant) {
      

        // const tenant = await admin.create({
        //     id: tenantId,
        //     companyName: 'Demo Testing Pvt Ltd',
        //     companyCode: 'DEMOTESTING',
        //     plan: 'basic',
        // });
try {
      const hashedPassword = Helper.encryptPassword('Admin@123');

        const adminUser = await admin.create({
            first_name: 'Admin',
            loginId: 'Admin',
            last_naem: 'User',
            phone: 1234567890,
            email: 'admin@demo.com',
            password: hashedPassword,
            role: 'admin',
            status:true
        });

        console.log(' Admin user created:', adminUser.email);
        return res.status(201).json({ success: true, message: 'Admin user created', data: adminUser });
} catch (error) {
    console.log("error", error);
    return Helper.response(false,error.message, "Error adding Admin user",  res, 500);  
    
}

      
    // } else {
    //     console.log('⚠️ Tenant already exists, skipping seed.');
    // }
}

exports.login = async (req, res) => {

  
  try {

    const a = CryptoJS.AES.decrypt(req.body.en, process.env.SECRET_KEY);
    const b = JSON.parse(a.toString(CryptoJS.enc.Utf8));
    const { email, password } = b;

    let magic = JSON.parse(CryptoJS.AES.decrypt(b.magic, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8));

    // const data = b
    if (!email || !password || !b.magic) {
      return Helper.response(
        Helper.encryptPassword(JSON.stringify("failed")),
        "Please provide all required fields",
        {},
        res,
        200
      );
    }


    let check = email.includes("@");
    const user = await admin.findOne({
      where: {
        [Op.or]: [{ email: email.trim() }, { loginId: email }],
        status:true
      },
    });
    

    if (!user) {
      return Helper.response(Helper.encryptPassword(JSON.stringify("failed")), "User not exists!", {}, res, 200);
    }
    if (password.trim() === Helper.decryptPassword(user.password)) {
      let token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.SECRET_KEY,
        {
          expiresIn: "7d",
        }
      );

      const userInfo = await admin.findByPk(user.id);
      userInfo.token = token;
      await userInfo.save();

      const usersData = await admin.findByPk(user.id);

    
            
      //console.log(getZone,"555")
      //return false
      if (usersData) {
       

        let data1 = {
          id: usersData.id,
          first_name: usersData.first_name,
          last_name: usersData.last_name,
          phone: usersData.phone,
          email: usersData.email,
          loginId: usersData.loginId,
          token: usersData.token,
          role: usersData.role,
          base_url: process.env.BASE_URL,
          magic: magic,
        }
        const responseString = JSON.stringify(data1);
        let encryptedResponse = Helper.encryptPassword(responseString)

        return Helper.response(
          Helper.encryptPassword(JSON.stringify("success")),
          "You have logged in successfully!",
          encryptedResponse,
          res,
          200
        );
      } else {
      }
    } else {
      return Helper.response(Helper.encryptPassword(JSON.stringify("failed")), "Invalid Credential", {}, res, 200);
    }
  } catch (error) {
    console.log(error);
    return Helper.response(Helper.encryptPassword(JSON.stringify("failed")), error?.message, {}, res, 200);
  }
};

function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

// exports.login = async (req, res) => {
//   const { email, password, tenantId } = req.body;

//   if (!email || !password || !tenantId) {
//     return Helper.response(
//       false,
//       "Email, password, and tenant ID are required.",
//       [],
//       res,
//       200
//     );
//   }

//   try {
//     const tenant = await Tenant.findOne({
//       where: {
//         companyCode: tenantId,
//         status: "active",
//       },
//     });

//     if (!tenant) {
//       return Helper.response(false, "Tenant not found!", [], res, 200);
//     }

//     const user = await User.findOne({
//       where: {
//         email,
//         tenantId: tenant.id,
//         status: "active",
//       },
//     });

//     if (!user) {
//       return Helper.response(false, "Invalid email or tenant.", [], res, 200);
//     }

//     const hashedInput = CryptoJS.SHA256(password).toString();
//     if (user.password !== hashedInput) {
//       return Helper.response(false, "Invalid password.", [], res, 200);
//     }

//     const token = jwt.sign(
//       { id: user.id, tenantId: user.tenantId, role: user.role },
//       process.env.SECRET_KEY,
//       { expiresIn: "8h" }
//     );

//     const webcamtoken = jwt.sign(
//       { id: user.id, tenantId: user.tenantId, role: user.role },
//       process.env.SECRET_KEY,
//       { expiresIn: "30d" }
//     );

//     const currencyList = await currency.findOne({
//       where: {
//         tenantId: tenant.id,
//         status: "active",
//       },
//     });

//     await user.update({ token, webcamtoken });

//     const baseUrl = process.env.BASE_URL;
//     const PORT = process.env.SERVER_PORT;
//     return Helper.response(
//       true,
//       "You have Logged In Successfully!",
//       { baseUrl, token, user, PORT, webcamtoken, currencyList },
//       res,
//       200
//     );
//   } catch (err) {
//     console.error("Login error:", err);
//     return Helper.response(false, err?.message, [], res, 200);
//   }
// };


// exports.logout = async (req, res) => {
//   const userId = req.users && req.users.id;
//   if (!userId) {
//     return Helper.response(false, "User ID is required.", [], res, 400);
//   }

//   try {
//     const user = await User.findByPk(userId);
//     if (!user) {
//       return Helper.response(false, "User not found.", [], res, 404);
//     }

//     // Clear the token from the user record
//     await user.update({ token: null });

//     return Helper.response(
//       true,
//       "You have logged out successfully!",
//       [],
//       res,
//       200
//     );
//   } catch (err) {
//     console.error("Logout error:", err);
//     return Helper.response(false, "Internal server error.", [], res, 500);
//   }
// };

// exports.Applogin = async (req, res) => {
//   try {
//     const data = req.body;
//     const { mobile } = req.body;
//     const user = await empPersonal.findOne({
//       where: {
//         mobile,
//         status: "active",
//       },
//     });
//     if (!user) {
//       return Helper.response(false, "No User Found", {}, res, 500);
//     }

//     const otps = new otp();

//     const templateId = "1407168931814895829";
//     // otps.otp = Math.floor(1000 + Math.random() * 9000);
//     otps.otp = 1234;
//     otps.phone = data.mobile;

//     otps.ip = Helper.getLocalIP();
//     otps.type = "App";
//     otps.expiry_time = `'${moment().add(5, "minutes").toDate()}'`;
//     otps.created_by = null;

//     const createOTP = await otps.save();

//     if (createOTP) {
//       //   await Helper.sendSMS(data.mobile, otps.otp, templateId);
//       return Helper.response("success", "OTP Send Successfully", {}, res, 200);
//     } else {
//       return Helper.response("failed", "Unable to sent OTP!", {}, res, 200);
//     }
//   } catch (error) {
//     console.log(error);
//     return Helper.response("failed", error?.message, {}, res, 200);
//   }
// };

// exports.verifyOtp = async (req, res) => {
//   try {
//     const data = req.body;

//     if (!data.mobile) {
//       return Helper.response(
//         "failed",
//         "Please provide all required fields",
//         {},
//         res,
//         200
//       );
//     }


//     const user = await otp.findOne({
//       where: {
//         phone: data.mobile, // Ensure 'data' exists before accessing 'mobile'
//         otp: data.otp, // Prevent potential 'undefined' errors
//         status: true,
//       },
//     });

//     if (!user) {
//       return Helper.response("failed", "Invalid OTP", {}, res, 200);
//     } else {
//       const now = new Date(); // Current time
//       const expiryTime = new Date(user.expiry_time);
//       const otpValidation = new otp();
//       if (now > expiryTime) {
//         return Helper.response("failed", "OTP Expired", {}, res, 200);
//       }
//       let verifyOTP = false;
//       if (data.otp == user.otp) {
//         verifyOTP = true;
//       }

//       if (verifyOTP) {
//         await otp.update(
//           { status: false },
//           {
//             where: {
//               phone: data.mobile,
//               otp: data.otp,
//             },
//           }
//         );
//         let usersData = await empPersonal.findOne({
//           where: {
//             mobile: data.mobile,
//             status: "active",
//           },
//         });
//         // await empPersonal.update(
//         //   { uniqueId: data.uniqueId , latitude:data.latitude,longitude:data.longitude},
//         //   {
//         //     where: {
//         //       mobile: data.mobile
//         //     },
//         //   }
//         // );
//         if (!usersData) {
//           return Helper.response("failed", "User Not Found", {}, res, 200);
//         }

//         let token = jwt.sign({ id: usersData.id }, process.env.SECRET_KEY, {
//           expiresIn: "7d",
//         });

//         const userInfo = await empPersonal.findByPk(usersData.id);
//         userInfo.token = token;
//         await userInfo.save();
//         let usersDataValue = await empPersonal.findByPk(usersData.id, {
//           raw: true,
//         });

//         if (usersDataValue) {
//           const designationDt = await Designation.findOne({
//             where: { id: usersDataValue.designationId },
//             raw: true,
//           });

//           usersDataValue.designation = designationDt?.name || null;
//         }

//         // await log.create({
//         //   tableName: "login",
//         //   recordId: user.id,
//         //   action: "CREATE",
//         //   oldData: JSON.stringify(data), // Convert data to JSON string safely
//         //   newData: JSON.stringify(data),
//         //   changedBy: req.users?.id || null, // Handle cases where req.users.id might be undefined
//         // });

//         return Helper.response(
//           "success",
//           "OTP Verified Successfully",
//           usersDataValue,
//           res,
//           200
//         );
//       } else {
//         return Helper.response("failed", "Invalid OTP", {}, res, 200);
//       }
//     }
//   } catch (error) {
//     console.log(error);
//     return Helper.response("failed", error?.message, {}, res, 200);
//   }
// };

// exports.Applogout = async (req, res) => {
//   console.log(req.users);

//   const id = req.users && req.users.id;
//   if (!id) {
//     return Helper.response(false, "User ID is required.", [], res, 400);
//   }

//   try {
//     const user = await empPersonal.findOne({
//       where: {
//         id,
//       },
//     });

//     if (!user) {
//       return Helper.response(false, "User not found.", [], res, 404);
//     }

//     // Clear the token from the user record
//     await user.update({ token: null });

//     return Helper.response(
//       true,
//       "You have logged out successfully!",
//       [],
//       res,
//       200
//     );
//   } catch (err) {
//     console.error("Logout error:", err);
//     return Helper.response(false, err?.message, [], res, 500);
//   }
// };
