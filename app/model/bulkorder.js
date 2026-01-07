// models/BulkOrder.js
const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const BulkOrder = sequelize.define("bulk_orders", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  productId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  totalPrice: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
});

// BulkOrder.sync({ alter: true }).then(() => {
//     console.log("BulkOrder model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing BulkOrder model:", error);
// });

module.exports = BulkOrder;
