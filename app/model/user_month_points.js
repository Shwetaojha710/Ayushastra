const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");


const UserMonthPoints = sequelize.define("user_month_points", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  parent_id: { type: DataTypes.INTEGER, allowNull: true },
  child_id: { type: DataTypes.INTEGER, allowNull: true },
  month: { type: DataTypes.STRING(7), allowNull: false },  // “2025-11”
  year: { type: DataTypes.STRING(7), allowNull: false },  // “2025-11”
  ayu_points: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  type: { type: DataTypes.STRING, allowNull:true},
}, {
  tableName: "user_month_points",
  timestamps: true
});


//   UserMonthPoints.sync({alter:true}).then(() => {
//     console.log('UserMonthPoints model synced successfully');
// }).catch((error) => {
//     console.error('Error syncing UserMonthPoints model:', error);
// });

module.exports = UserMonthPoints;
