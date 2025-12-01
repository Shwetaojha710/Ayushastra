const CryptoJS = require("crypto-js");
const Helper = {};
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const UPLOAD_DIR = path.join(__dirname, "../../upload"); // adjust path to your upload folder
const os = require("os");
const axios = require("axios");
const fileType = require("file-type");
const moment = require("moment");

Helper.response = (status, message, data = [], res, statusCode) => {
  return res.status(statusCode).json({
    status,
    message,
    data,
  });
};
Helper.encryptPassword = (password) => {
  var pass = CryptoJS.AES.encrypt(password, process.env.SECRET_KEY).toString();
  return pass;
};

(Helper.deleteFile = (fileName) => {
  try {
    if (!fileName) return;

    const filePath = path.join(UPLOAD_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
  } catch (err) {
    console.error("Error deleting file:", err.message);
  }
}),
  (Helper.decryptPassword = (password) => {
    var bytes = CryptoJS.AES.decrypt(password, process.env.SECRET_KEY);
    var originalPassword = bytes.toString(CryptoJS.enc.Utf8);
    return originalPassword;
  });

Helper.verifyToken = (token) => {
  try {
    const secret = process.env.SECRET_KEY || "your_jwt_secret";
    return jwt.verify(token, secret);
  } catch (err) {
    console.error("Token verification error:", err);
    return null;
  }
};

Helper.deleteUploadedFiles = (files) => {
  if (!files || typeof files !== "object") return;

  try {
    for (const key in files) {
      const fileArray = Array.isArray(files[key]) ? files[key] : [files[key]];

      for (const file of fileArray) {
        if (file?.filename) {
          const filePath = path.join(
            __dirname,
            "../../../upload",
            file.filename
          );
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
    }
  } catch (err) {
    console.error("Error deleting uploaded files:", err);
  }
};

Helper.calculateDuration=(startTime, endTime)=> {
  const start = moment(startTime, "hh:mm A");
  const end = moment(endTime, "hh:mm A");

  const duration = moment.duration(end.diff(start));
  return  `${duration.hours()}h ${duration.minutes()}m`
   

}
Helper.toAmPm=(timeStr)=> {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const adjusted = ((hours + 11) % 12 + 1);
  return `${adjusted.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}

Helper.dateFormat = (date) => {
  const istDate = new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // 12-hour format (AM/PM)
    timeZone: "Asia/Kolkata",
  });

  return istDate.replace(/\b(am|pm)\b/, (match) => match.toUpperCase());
};
Helper.newDateFormat = (date) => {
  const istDate = new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "short",
  });

  return istDate;
};

Helper.getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (let name in interfaces) {
    for (let iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1"; // Fallback in case no network is found
};

Helper.sendSMS = async (mobile, otp, templateId) => {
  const msg = `Dear User, OTP for login request is ${otp}, OTP is valid for 5 minutes.Quaere`;
  const encodedMessage = encodeURIComponent(msg);

  const url=`http://sms.quaeretech.com/submitsms.jsp?user=QuaereE&key=df87c28c39XX&mobile=${mobile}&message=${encodedMessage}&senderid=QUAERE&accusage=1&entityid=1101596760000028822&tempid=1107167697715427582`
 
  try { 
    const response = await axios.get(url, {
      headers: {
        Cookie: "JSESSIONID=1A15A5E676AF3873C49C0426F6EF319C",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error sending SMS:", error.message);
    return null;
  }
};

const crypto = require("crypto");
const registered_user = require("../model/registeredusers");
const incentive_levels = require("../model/incentive_levels");
const UserMonthPoints = require("../model/user_month_points");
const Cart = require("../model/cart");

Helper.generateOrderNumber =async () => {
  // Generate random 4-byte hex and prefix with "ORD-"
 const date = new Date();
  const yyyy = date.getFullYear().toString().slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const random = crypto.randomBytes(2).toString("hex");
  return `ORD-${yyyy}${mm}${dd}-${random}`; // e.g. ORD-251030-3af1
}

// const bcrypt = require("bcryptjs");

// Helper.comparePassword = async (enteredPassword, storedHashedPassword) => {
//   return await bcrypt.compare(enteredPassword, storedHashedPassword);
// };

Helper.moveFile = async (file, baseUploadDir, userId) => {
  try {
    await fs.promises.mkdir(baseUploadDir, { recursive: true });

    const buffer = await fs.promises.readFile(file.filepath);
    const detectedType = await fileType.fromBuffer(buffer);

    const allowedTypes = {
      "image/png": ["png"],
      "image/jpeg": ["jpg", "jpeg"],
      "image/jpg": ["jpg"],
      "application/pdf": ["pdf"],
    };

    if (!detectedType || !allowedTypes[detectedType.mime]) {
      return { error: `Invalid file type.` };
    }

    const fileExtension = path.extname(file.originalFilename).slice(1).toLowerCase();
    const validExtensions = allowedTypes[detectedType.mime];

    const isValidExtension = Array.isArray(validExtensions)
      ? validExtensions.includes(fileExtension)
      : validExtensions == fileExtension;

    if (!isValidExtension) {
      return { error: `File extension does not match file content.` };
    }

    // //   Check for malicious content in PDFs
    if (detectedType.mime === "application/pdf") {
      const pdfContent = buffer.toString('utf8');
      const suspiciousPatterns = [/\/JavaScript/,/app\.alert/i, /<script>/i];
    
      const matchedPattern = suspiciousPatterns.find(pattern => pattern.test(pdfContent));
    
      if (matchedPattern) {
        console.log(`Matched suspicious pattern: ${matchedPattern}`);
        return { error: `PDF contains potentially harmful content. Pattern matched: ${matchedPattern}` };
      }
    }
    
    const finalExtension = Array.isArray(validExtensions) ? validExtensions[0] : validExtensions;
     if(!userId){
      const uniqueNumber = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
      console.log(uniqueNumber); // Example: '1715172413382871'
      userId=uniqueNumber
     }
    const filePath = path.join(
      baseUploadDir,
      `${userId}_${Date.now()}.${finalExtension}`
    );

    await fs.promises.rename(file.filepath, filePath);

    const stats = await fs.promises.stat(filePath);
    const fileSize = (stats.size / 1024).toFixed(0); // in KB

    return { filePath, fileSize };
  } catch (error) {
    console.error(`File move error:`, error.message);
    return { error: error.message };
  }
};


Helper.generateReferralCode = (name = "") => {
  const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 chars
  const base = name ? name.substring(0, 3).toUpperCase() : "USR";
  return `${base}${randomStr}`;
};



Helper.getDescendants = async (userId)=> {
  const result = [];
  const queue = [userId];

  while (queue.length) {
    const currentId = queue.shift();

    const children = await registered_user.findAll({
      where: { referred_by: currentId },
      attributes: ["id"]
    });

    for (const child of children) {
      result.push(child.id);
      queue.push(child.id);
    }
  }

  return result;
}

Helper.checkEligibility = async (userId) =>{
  const user = await registered_user.findByPk(userId);

  const directCount = await registered_user.count({ where: { referred_by: userId } });

  const groupUsers = await getDescendants(userId);

  return {
    eligible:
      directCount >= 10 &&
      groupUsers.length >= 20 &&
      user.monthly_purchase >= 1000,
    directCount,
    groupCount: groupUsers.length,
    monthlyPurchase: user.monthly_purchase
  };
}

Helper.getLevel=async (ayuPoints)=> {
  const level = await incentive_levels.findOne({
    where: { min_ayupoints: { [Op.lte]: ayuPoints } },
    order: [["min_ayupoints", "DESC"]]
  });

  return level ? level.percentage : 0;
}


Helper.sumPoints = async (userId, month) =>{
  const row = await UserMonthPoints.findOne({ where: { user_id: userId, month } });
  return row ? row.ayu_points : 0;
}

async function sumGroupPoints(rootUserId, month) {
  const descendants = await Helper.getDescendants(rootUserId);
  const ids = [rootUserId, ...descendants];

  return await UserMonthPoints.sum("ayu_points", { where: { user_id: ids, month } }) || 0;
}

Helper.calculateIncentive=async (userId, month)=> {
  const eligibility = await Helper.checkEligibility(userId);
  if (!eligibility.eligible) return { incentive: 0, eligibility };

  const userTotalPoints = await sumGroupPoints(userId, month);
  const userLevel = await Helper.getLevel(userTotalPoints);

  const directMembers = await registered_user.findAll({
    where: { referred_by: userId },
    attributes: ["id", "first_name"]
  });

  let incentive = 0;
  let details = [];

  for (const d of directMembers) {
    const groupPoints = await sumGroupPoints(d.id, month);
    const groupLevel = await Helper.getLevel(groupPoints);

    const diff = userLevel - groupLevel;
    const payout = diff > 0 ? (groupPoints * diff) / 100 : 0;

    incentive += payout;

    details.push({
      groupUser: d.first_name,
      groupPoints,
      groupLevel,
      diffPercentage: diff,
      payout
    });
  }

  return { incentive, userLevel, details };
}

Helper.generateDoctorReferralCode = (name = "") => {
  const prefix = "DOC";

  const namePart = name
    ? name.replace(/[^A-Z]/gi, "").substring(0, 3).toUpperCase()
    : "DRX";

  const randomPart = crypto.randomBytes(2).toString("hex").toUpperCase(); // 4 chars

  return `${prefix}${namePart}${randomPart}`;
};

Helper.getCurrentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const bcrypt = require("bcrypt");

Helper.comparePassword = async (plainPassword, hashedPassword) => {
  try {
    if (!plainPassword || !hashedPassword) return false;
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
};

Helper.mergeCartOnLogin = async (deviceId, userId) => {
  // Fetch guest cart
  const guestCart = await Cart.findAll({ where: { deviceId } });

  // Fetch user cart
  const userCart = await Cart.findAll({ where: { registeruserId: userId } });

  for (const g of guestCart) {
    const existing = userCart.find(u => u.productId === g.productId);

    if (existing) {
      // update quantity
      const newQty = Number(existing.quantity) + Number(g.quantity);
      const newTotal = Number(existing.price) * newQty;

      await existing.update({ quantity: newQty, total: newTotal });
      await g.destroy(); // delete guest row
    } else {
      // transfer the row to user
      await g.update({
        registeruserId: userId,
        deviceId: null,
      });
    }
  }
}

Helper.mergeGuestCartToUser = async (deviceId, userId)=> {
  if (!deviceId || !userId) return;

  const guestCart = await Cart.findAll({ where: { deviceId } });
  const userCart = await Cart.findAll({ where: { registeruserId: userId } });

  for (const guestItem of guestCart) {
    const match = userCart.find(u => u.productId === guestItem.productId);

    if (match) {
      const newQty = Number(match.quantity) + Number(guestItem.quantity);
      const newTotal = Number(match.price) * newQty;

      await match.update({ quantity: newQty, total: newTotal });
      await guestItem.destroy();
    } else {
      await guestItem.update({
        registeruserId: userId,
        deviceId: null
      });
    }
  }
}

Helper.filterProducts = (data, searchKey)=> {
  if (!searchKey || searchKey.trim() === "") return data;

  const key = searchKey.toLowerCase();
    console.log(key,"keyyyyy");
    
  return data.filter(item => {
    return (
      item.product_name?.toLowerCase().includes(key) ||
      item.offer_price?.toString().toLowerCase().includes(key) ||
      item.brand?.label?.toLowerCase().includes(key) ||
      item.product_types?.label?.toLowerCase().includes(key) ||
      item.unit_data?.label?.toLowerCase().includes(key)||
      item.category?.label?.toLowerCase().includes(key)||
      item.ingredient?.some(ing =>ing.label.toLowerCase().includes(key)) ||
      // item.category?.some(ing =>ing.label.toLowerCase().includes(key)) ||
      item.disease?.some(ing =>ing.label.toLowerCase().includes(key)) 
   
    );
  });
}

module.exports = Helper;
