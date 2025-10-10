const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");

const product_gallery = sequelize.define(
  "product_gallery",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
       autoIncrement: true,
    },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false },
    doc_type: { type: DataTypes.STRING, allowNull: true },

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdBy: DataTypes.INTEGER,
    updatedBy: DataTypes.INTEGER,
  },
   {
    tableName: "product_gallery",
    timestamps: true,
  }
//   { timestamps: true }
);

// product_gallery
//   .sync()
//   .then(() => {
//     console.log("product_gallery model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing product_gallery model:", error);
//   });

module.exports = product_gallery;
