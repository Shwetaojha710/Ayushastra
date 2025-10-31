const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");
const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);
//     Payment.sync({alter:true}).then(() => {
//     console.log('Payment model synced successfully');
// }).catch((error) => {
//     console.error('Error syncing Payment model:', error);
// });

module.exports = Payment;
