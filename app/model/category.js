const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");


const Category = sequelize.define(
  "category",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    doc_type:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "category",
    timestamps: false,
  }
);

// Category.sync({ alter: true })
//   .then(() => {
//     console.log("Category model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing Category model:", error);
//   });

module.exports = Category;
