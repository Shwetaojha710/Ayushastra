  const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const { duration } = require("moment/moment");

   const StateMaster = sequelize.define("StateMaster", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsDeleted: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: "state_master",
    schema: "public",
    timestamps: false
  });



  
// StateMaster.sync()
//   .then(() => {
//     console.log("StateMaster model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing StateMaster model:", error);
//   });

module.exports = StateMaster;