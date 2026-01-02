const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const PrakritiQuestion = sequelize.define("prakriti_question", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  prakriti_category_id: { type: DataTypes.INTEGER, allowNull: true },
  question: { type: DataTypes.STRING, allowNull: false },
  question_hint: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.BOOLEAN, allowNull: true,defaultValue:true }
});

// PrakritiCategory.hasMany(PrakritiQuestion, {
//   foreignKey: "category_id",
//   onDelete: "CASCADE",
// });

// PrakritiQuestion.belongsTo(PrakritiCategory, {
//   foreignKey: "category_id",
// });

// PrakritiQuestion.sync({alter:true}).then(() => {
//     console.log("PrakritiQuestion model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing PrakritiQuestion model:", error);
// });

module.exports = PrakritiQuestion;
