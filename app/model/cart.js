const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const Cart = sequelize.define(
  "cart",
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
      type: DataTypes.INTEGER,
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
    tableName: "cart",
    timestamps: true,
  }
);

// Cart.sync({ alter: true }).then(() => {
//     console.log("Cart model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing Cart model:", error);
// });

module.exports = Cart;
