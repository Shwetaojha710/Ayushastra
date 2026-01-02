const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const PrakritiOption = sequelize.define("prakritiOption", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  question_id: { type: DataTypes.INTEGER, allowNull: true, },
  option_label: { type: DataTypes.STRING, allowNull: false }, // e.g., Thin / Lean
  dosha: { type: DataTypes.ENUM("V", "P", "K"), allowNull: false },
  value: { type: DataTypes.INTEGER, defaultValue: 1 }
});


// PrakritiOption.sync({alter:true}).then(() => {
//     console.log("PrakritiOption model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing PrakritiOption model:", error);
// });
module.exports = PrakritiOption;
