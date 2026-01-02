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
const PrakritiRecommendation = require("../model/prakriti_recommendations");

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

Helper.getCartSummaryInternal= async(req)=> {
  try {
    const mockRes = {
      json: (data) => data,
    };

    // Call your actual cart logic
    let result;

    await exports.getAppCartList(
      req,
      {
        json: (data) => (result = data),
      }
    );

    return result;
  } catch (err) {
    return { success: false, message: err.message };
  }
}


Helper.calculatePrakriti=(vata, pitta, kapha)=> {
  const scores = { Vata: vata, Pitta: pitta, Kapha: kapha };

  // Sort doshas by score (highest first)
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  const [d1, s1] = sorted[0]; // highest
  const [d2, s2] = sorted[1]; // second highest
  const [d3, s3] = sorted[2]; // lowest

  const diff12 = s1 - s2; // top two difference
  const diff23 = s2 - s3; // second and third
  const diff13 = s1 - s3; // highest and lowest

  // -------------------------------------------
  // 1️⃣ SINGLE DOSHA PRAKRITI (Ek-Doshaja)
  // Highest dosha is ≥ 3 points above the rest
  // -------------------------------------------
  if (diff12 >= 3 && diff13 >= 3) {
    return d1 + " Prakriti";
  }

  // -------------------------------------------
  // 2️⃣ DUAL DOSHA PRAKRITI (Dwi-Doshaja)
  // Top two doshas differ by ≤ 2 points
  // -------------------------------------------
  if (diff12 <= 2 && diff23 >= 3) {
    return `${d1}-${d2}`; // example: Vata-Pitta
  }

  // -------------------------------------------
  // 3️⃣ TRI-DOSHA PRAKRITI
  // All three doshas within ≤ 2 points
  // -------------------------------------------
  if (diff13 <= 2) {
    return "Tridosha";
  }

  // Default fallback (should not occur normally)
  return d1 + " Prakriti";
}

Helper.parseIds = (ids) => {
  if (!ids) return [];

  return ids
    .toString()
    .split(",")
    .map((i) => parseInt(i.trim()))
    .filter((i) => !isNaN(i));
};


Helper.getPrakritiRecommendations = async (prakriti) => {
  try {
    const  prakriti_type  = prakriti;

    if (!prakriti_type) {
      return Helper.response(
        false,
        "prakriti_type is required",
        [],
        res,
        400
      );
    }

    const data = await PrakritiRecommendation.findAll({
      where: {
        prakriti_type: prakriti_type.toUpperCase(),
      },
      order: [["id", "ASC"]],
      raw: true,
    });

    if (!data.length) {
      return false
    }

    // Group by section
    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.section]) acc[item.section] = [];
      acc[item.section].push({
        title: item.title,
        description: item.description,
      });
      return acc;
    }, {});
   
   return groupedData
    // return Helper.response(
    //   true,
    //   "Prakriti recommendations fetched successfully",
    //   groupedData,
    //   res,
    //   200
    // );
  } catch (error) {
    console.error("Prakriti Recommendation API Error:", error);
    // return error?.message
    return Helper.response(false, error.message, [], res, 500);
  }
};

Helper.generateConsultationBookingId = (type = "") => {
  // -------------------------
  // DATE PART (YYYYMMDD)
  // -------------------------
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const datePart = `${yyyy}${mm}${dd}`;

  // -------------------------
  // TYPE → PREFIX
  // -------------------------
  let prefix = "CN";

  if (type) {
    const parts = type.split("_");
    const lastPart = parts[parts.length - 1]; // appointment

    prefix = lastPart
      .substring(0, 2)
      .toUpperCase()
      .padEnd(2, "X");
  }

  // -------------------------
  // RANDOM PART
  // -------------------------
  const randomPart = crypto
    .randomBytes(4)
    .toString("base64")
    .replace(/[^A-Z0-9]/gi, "")
    .substring(0, 6)
    .toUpperCase();

  return `${prefix}-${datePart}-${randomPart}`;
};


Helper.sendPushNotification = async (deviceToken, title, message, data = {}) => {
  const stringifiedData = {};
  for (const key in data) {
    stringifiedData[key] = typeof data[key] === 'object'
      ? JSON.stringify(data[key])
      : String(data[key]);
  }
 
  const payload = {
    token: deviceToken,
    notification: {
      title,
      body: message
    },
    data: stringifiedData
  };
  try {
    await admin.messaging().send(payload);
    console.log("Push notification sent successfully");
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};


Helper.safeParse = (value) => {
  if (!value) return [];

  // already array
  if (Array.isArray(value)) return value;

  // must be string
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    // fallback: treat as single text value
    return [value];
  }
};

const normalizePrakriti = (title) => {
  if (!title) return null;
  const t = title.toUpperCase().trim();
  if (t === "VATTA") return "VATA"; // 🔥 important mapping
  return t;
};

Helper.mergePrakritiData = (input) => {
  const merged = {};

  input.forEach((item) => {
    const prakriti = normalizePrakriti(item.title);
    if (!prakriti) return;

    // Initialize once
    if (!merged[prakriti]) {
      merged[prakriti] = {
        title: prakriti,
        AAHAR: [],
        VIHAR: [],
        CHIKITSA: [],
      };
    }

    // Merge sections
    ["AAHAR", "VIHAR", "CHIKITSA"].forEach((section) => {
      if (Array.isArray(item[section]) && item[section].length) {
        merged[prakriti][section].push(...item[section]);
      }
    });
  });

  return Object.values(merged);
};



const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");

Helper.generatePrescriptionPDF = async (data) => {
  try {
    const prescription = data[0];
    if (!prescription) return null;

    const {
      booking_id,
      doctor_id,
      user_id,
      notes,
      diagnosis,
      prakriti_assessment,
      created_at,
    } = prescription;

    const dirPath = path.join(__dirname, "../../upload/prescriptions");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const fileName = `prescription_${booking_id}.pdf`;
    const filePath = path.join(dirPath, fileName);

    await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      doc.fontSize(20).text("Prescription", { align: "center" }).moveDown();

      doc.fontSize(12);
      doc.text(`Booking ID: ${booking_id}`);
      doc.text(`Doctor ID: ${doctor_id}`);
      doc.text(`Patient ID: ${user_id}`);
      doc.text(`Date: ${new Date(created_at).toDateString()}`);
      doc.moveDown();

      doc.text("Diagnosis:", { underline: true });
      doc.text(diagnosis || "N/A").moveDown();

      doc.text("Notes:", { underline: true });
      doc.text(notes || "N/A").moveDown();

      doc.text(`Prakriti Assessment: ${prakriti_assessment ? "Yes" : "No"}`);

      doc.end();

      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    return `${baseUrl}upload/prescriptions/${fileName}`;

  } catch (error) {
    console.error("Generate Prescription PDF Error:", error);
    return null;
  }
};

Helper.formatAndGroupAddresses = (addresses = []) => {
  if (!addresses.length) return [];

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

  // Billing = Shipping
  Object.values(grouped).forEach(group => {
    if (
      group.isBillingSameAsShipping &&
      group.billing &&
      !group.shipping
    ) {
      group.shipping = { ...group.billing };
    }
  });

  return Object.values(grouped);
};


module.exports = Helper;
