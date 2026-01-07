const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");


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
    coupon_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    coupon_discount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
   ayu_cash: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
   ayucash_used: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
   term: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
   maxRedeemableAyuCash: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
   ayu_cash_apply: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
   txn_id: {
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
    },
     is_billing_same_as_shipping: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
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
