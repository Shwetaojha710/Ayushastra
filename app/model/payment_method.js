const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const payment_method = sequelize.define(
  "payment_method",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    eWalletamt: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
        defaultValue: 0,
    },
     
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
        allowNull: true,
    },
   status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    tableName: "payment_method",
    timestamps: true,
  }
);
//     payment_method.sync({alter:true}).then(() => {
//     console.log('payment_method model synced successfully');
// }).catch((error) => {
//     console.error('Error syncing payment_method model:', error);
// });

module.exports = payment_method;
