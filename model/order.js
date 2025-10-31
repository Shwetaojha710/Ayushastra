const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");


const Order = sequelize.define("Order", {
    id: {
      type: DataTypes.INTEGER,
   autoIncrement:true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    billing_address_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    shipping_address_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0
    },
    shipping_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    order_no: {
      type: DataTypes.STRING,
      allowNull: true
    },
    user_type: {
      type: DataTypes.STRING,
      allowNull: true
    },

    payment_status: {
      type: DataTypes.STRING(50),
      defaultValue: "pending"
    },
    order_status: {
      type: DataTypes.STRING(50),
      defaultValue: "placed"
    }
  }, {
    tableName: "orders",
    timestamps: true,
    underscored: true
  });

//   Order.sync({alter:true}).then(() => {
//     console.log('order model synced successfully');
// }).catch((error) => {
//     console.error('Error syncing order model:', error);
// });

module.exports = Order;
