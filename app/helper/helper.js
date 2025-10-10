const CryptoJS = require("crypto-js");
const Helper = {};
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const UPLOAD_DIR = path.join(__dirname, "../../upload"); // adjust path to your upload folder

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

module.exports = Helper;
