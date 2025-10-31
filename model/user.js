const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");

const User = sequelize.define(
  "User",
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
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,   
  }
);
// User.sync({alter:true}).then(() => {
//     console.log('User model synced successfully');
// }).catch((error) => {
//     console.error('Error syncing User model:', error);
// });

module.exports = User;
