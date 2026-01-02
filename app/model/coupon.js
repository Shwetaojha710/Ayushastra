const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const coupons = sequelize.define("coupons", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  coupon_name:{
    type: DataTypes.STRING,
    allowNull: false,
  },
 min_amount:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  max_discount:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  discount_type:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_id:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  start_time:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  end_time:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  usage_per_user:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  coupon_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
 
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

});

// coupons.sync({alter:true}).then(() => {
//     console.log('coupons model synced successfully');
// }).catch((error) => {
//     console.error('Error syncing coupons model:', error);
// });

module.exports=coupons