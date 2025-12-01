  const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const { duration } = require("moment/moment");
  

const family_member = sequelize.define('family_member', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    age: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'family_member',
    underscored: true,
  });

  // family_member.sync()
  // .then(() => {
  //   console.log("family_member model synced successfully");
  // })
  // .catch((error) => {
  //   console.error("Error syncing family_member model:", error);
  // });

module.exports = family_member;