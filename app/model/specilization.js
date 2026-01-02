const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const speclization = sequelize.define("speclization", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    details: {
        type: DataTypes.STRING,
        allowNull: true,
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
    tableName: "speclization",
    timestamps: true
});

// speclization.sync({ alter: true }).then(() => {
//     console.log("speclization model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing speclization model:", error);
// });

module.exports = speclization;