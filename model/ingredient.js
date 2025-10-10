const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");

const ingredient = sequelize.define("ingredient", {
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
    tableName: "ingredient",
    timestamps: true
});

// ingredient.sync({ alter: true }).then(() => {
//     console.log("ingredient model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing ingredient model:", error);
// });

module.exports = ingredient;