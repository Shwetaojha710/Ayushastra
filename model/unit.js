const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");

const Unit = sequelize.define("unit", {
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
    tableName: "unit",
    timestamps: true
});

// Unit.sync({ alter: true }).then(() => {
//     console.log("unit model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing unit model:", error);
// });

module.exports = Unit;