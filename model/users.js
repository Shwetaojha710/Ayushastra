const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,  // ✅ instead of defaultValue: DataTypes.INTEGER
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Name is required" },
      len: { args: [2, 100], msg: "Name must be between 2 and 100 characters" },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: "Email must be valid" },
      notEmpty: { msg: "Email is required" },
    },
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: { msg: "Date of birth must be a valid date" },
    },
  },
  joinDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
     userType: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: { 
    type: DataTypes.ENUM("male", "female", "other"),
    allowNull: false,
    validate: {
      isIn: {
        args: [["male", "female", "other"]],
        msg: "Gender must be male, female, or other",
      },
    },
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: { msg: "Age must be a number" },
      min: { args: [0], msg: "Age cannot be negative" },
    },
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM("admin", "superadmin"),
    defaultValue: "admin",
    validate: {
      isIn: {
        args: [["admin", "superadmin"]],
        msg: "Role must be either admin or superadmin",
      },
    },
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: { msg: "Height must be a number" },
    },
  },
  weight: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: { msg: "Weight must be a number" },
    },
  },
  refferalCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cityId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stateId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pinCode: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isNumeric: { msg: "Pin code must contain only numbers" },
      len: { args: [4, 10], msg: "Pin code must be between 4 and 10 digits" },
    },
  },
  addharNo: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isNumeric: { msg: "Aadhar number must contain only numbers" },
      len: { args: [12, 12], msg: "Aadhar number must be exactly 12 digits" },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Password is required" },
      len: { args: [6, 100], msg: "Password must be at least 6 characters long" },
    },
  },
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
    allowNull: false,
    validate: {
      isIn: {
        args: [["active", "inactive"]],
        msg: "Status must be active or inactive",
      },
    },
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null,
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null,
  },
});

// User.sync()
//   .then(() => {
//     console.log("User model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing User model:", error);
//   });

module.exports = User;
