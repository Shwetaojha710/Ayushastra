const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");
const Category = require("./category");

const SubCategory = sequelize.define(
  "subcategory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  {
    tableName: "subcategory",
    timestamps: false,
  }
);
// Association
// Category.hasMany(SubCategory, { foreignKey: "category_id" });
// SubCategory.belongsTo(Category, { foreignKey: "category_id" });

// SubCategory.sync({ alter: true })
//   .then(() => {
//     console.log("SubCategory model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing SubCategory model:", error);
//   });

module.exports = SubCategory;
