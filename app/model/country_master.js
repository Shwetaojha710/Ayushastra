  const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const { duration } = require("moment/moment");

  const country_master = sequelize.define("country_master", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: true
    },
    country_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country_name: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: "country_master",
    schema: "public",
    timestamps: false
  });




  
// CountryMaster.sync()
//   .then(() => {
//     console.log("CountryMaster model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing CountryMaster model:", error);
//   });

module.exports = country_master;