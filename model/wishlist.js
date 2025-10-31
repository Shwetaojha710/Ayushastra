const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");

const wishlist = sequelize.define(
  "wishlist",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    deviceId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    registeruserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
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
    tableName: "wishlist",
    timestamps: true,
  }
);

// wishlist.sync({ alter: true }).then(() => {
//     console.log("wishlist model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing wishlist model:", error);
// });

module.exports = wishlist;
