const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");


  const referral_master = sequelize.define("referral_master", {
    id: { type: DataTypes.INTEGER, autoIncrement:true, primaryKey: true },

    like: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    share: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    new_register: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    prakrati_bonus: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    immunity_bonus: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    referrer_bonus: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    referee_bonus: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },

    createdBy: { type: DataTypes.INTEGER, allowNull: true },
    updatedBy: { type: DataTypes.INTEGER, allowNull: true },
  });



// referral_master.sync()
//   .then(() => {
//     console.log("referral_master model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing referral_master model:", error);
//   });

module.exports = referral_master;
