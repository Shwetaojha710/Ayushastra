const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const registered_user = sequelize.define(
  "registered_user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement:true
    },
    referred_by: {
      type: DataTypes.INTEGER,
      allowNull:true
    },
    referral_code: {
      type: DataTypes.STRING,
      allowNull:true
    },
    ayucash_balance: {
      type: DataTypes.DECIMAL(10,2),
      allowNull:true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique:true
    },
    mobile: {
      type: DataTypes.STRING(15),
       unique:true
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull:true
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    confirmPassword: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    country: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    
    token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deviceToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deviceId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    deviceId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue:false
    },
    monthly_purchase: {
     type: DataTypes.DECIMAL(10,2),
     defaultValue: 0
    },

    ayu_points: {
     type: DataTypes.INTEGER,
     defaultValue: 0
   },
    isemail_verified: {
     type: DataTypes.BOOLEAN,
     allowNull:true,
     defaultValue:false
    },

    isMobile_verified: {
     type: DataTypes.BOOLEAN,
     allowNull:true,
     defaultValue:false
   },
    firebase_token: {
     type: DataTypes.TEXT,
     allowNull:true,
   },

  },
  {
    tableName: "registered_user",
    timestamps: true,   
  }
);

// registered_user.sync({alter:true}).then(() => {
//     console.log('registered_user model synced successfully');
// }).catch((error) => {
//     console.error('Error syncing registered_user model:', error);
// });

module.exports = registered_user;
