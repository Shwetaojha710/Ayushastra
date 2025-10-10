const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");

const ProductType = sequelize.define("product_type", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
     createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: "product_type",
    timestamps: true
});

// ProductType.sync({ alter: true }).then(() => {
//     console.log("ProductType model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing ProductType model:", error);
// });

module.exports = ProductType;