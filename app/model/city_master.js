  const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const { duration } = require("moment/moment");

 const CityMaster = sequelize.define(
    "city_master",
    {
      id: {
        type: DataTypes.STRING,
        allowNull: true,
        primaryKey: true
      },
      city_name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      city_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      IsDeleted: {
        type: DataTypes.STRING,
        allowNull: true
      },
      CreatedDate: {
        type: DataTypes.STRING,
        allowNull: true
      },
      state_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      country_id: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: "city_master",
      schema: "public",
      timestamps: false
    }
  );



  
// CityMaster.sync()
//   .then(() => {
//     console.log("CityMaster model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing CityMaster model:", error);
//   });

module.exports = CityMaster;