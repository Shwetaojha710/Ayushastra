 
 const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
 const OrderItem = sequelize.define("OrderItem", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement:true,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    }
  }, {
    tableName: "order_items",
    timestamps: false,
  });
//     OrderItem.sync({alter:true}).then(() => {
//     console.log('OrderItem model synced successfully');
// }).catch((error) => {
//     console.error('Error syncing OrderItem model:', error);
// });

module.exports = OrderItem;
