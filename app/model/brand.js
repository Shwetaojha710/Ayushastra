const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const Brand = sequelize.define("brand", {
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
    tableName: "brand",
    timestamps: true
});

// Brand.sync({ alter: true }).then(() => {
//     console.log("brand model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing brand model:", error);
// });

module.exports = Brand;