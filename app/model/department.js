const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const department = sequelize.define("department", {
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
    tableName: "department",
    timestamps: true
});

// department.sync({ alter: true }).then(() => {
//     console.log("department model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing department model:", error);
// });

module.exports = department;