const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const Salt = sequelize.define(
  "salt",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "salt",
    timestamps: true,
  }
);

// Salt.sync({ alter: true }).then(() => {
//     console.log("Salt model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing Salt model:", error);
// });

module.exports = Salt;
