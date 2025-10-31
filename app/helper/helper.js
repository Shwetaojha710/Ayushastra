const CryptoJS = require("crypto-js");
const Helper = {};
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const UPLOAD_DIR = path.join(__dirname, "../../upload"); // adjust path to your upload folder
const os = require("os");
const axios = require("axios");
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
const moment = require("moment");
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

Helper.generateOrderNumber =async () => {
  // Generate random 4-byte hex and prefix with "ORD-"
 const date = new Date();
  const yyyy = date.getFullYear().toString().slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const random = crypto.randomBytes(2).toString("hex");
  return `ORD-${yyyy}${mm}${dd}-${random}`; // e.g. ORD-251030-3af1
}

module.exports = Helper;
