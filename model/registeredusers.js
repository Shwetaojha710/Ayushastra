const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");

const registered_user = sequelize.define(
  "registered_user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement:true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobile: {
      type: DataTypes.STRING(15),
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
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
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
