const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const { duration } = require("moment/moment");

const Doctor = sequelize.define("doctor", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  loginId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  refferedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
  known_language:{
    type:DataTypes.STRING,
    allowNull:true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cert_image: {
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
   degree: {
    type: DataTypes.STRING,
    allowNull: true,
  },
   experience: {
    type: DataTypes.STRING,
    allowNull: true,
  },
   universityName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
   speciality: {
    type: DataTypes.STRING,
    allowNull: true,
  },
   about: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
   registrationNo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
   registrationDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  fatherName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  motherName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  panNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
 
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Password is required" },
      len: {
        args: [6, 100],
        msg: "Password must be at least 6 characters long",
      },
    },
  },
  // status: {
  //   type: DataTypes.ENUM("active", "inactive"),
  //   defaultValue: "active",
  //   allowNull: false,
  //   validate: {
  //     isIn: {
  //       args: [["active", "inactive"]],
  //       msg: "Status must be active or inactive",
  //     },
  //   },
  // },
   status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  KYCstatus: {
    type: DataTypes.ENUM("pending", "approved","rejected"),
    defaultValue: "pending",
    allowNull: false,
    validate: {
      isIn: {
        args: [["pending", "approved","rejected"]],
        msg: "Status must be pending,approved or rejected",
      },
    },
  },
  year_of_completion:{
  type:DataTypes.DATEONLY,
  allowNull:true
  },
  joinDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  regType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  consultancyCharge: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  addharFrontImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  addharBackImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  disease: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  textConsult: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phoneConsult: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  availability: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  online_consultation_fees: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_feature: {
    type: DataTypes.BOOLEAN,
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

// Doctor.sync({alter:true})
//   .then(() => {
//     console.log("Doctor model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing Doctor model:", error);
//   });

module.exports = Doctor;
