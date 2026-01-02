const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const PrakritiCategory = sequelize.define("prakriti_category", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  category_name: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.BOOLEAN, allowNull: true,defaultValue:true },
});

module.exports = PrakritiCategory;
