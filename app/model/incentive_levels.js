  const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const { duration } = require("moment/moment");

const incentive_levels = sequelize.define('incentive_levels', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    min_ayupoints: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
    },
    percentage: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
    },
   
  }, {
    tableName: 'incentive_levels',
    underscored: true,
  });

//   incentive_levels.sync()
//   .then(() => {
//     console.log("incentive_levels model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing incentive_levels model:", error);
//   });

module.exports = incentive_levels;