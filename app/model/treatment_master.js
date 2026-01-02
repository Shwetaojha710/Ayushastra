const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const treatment_master = sequelize.define("treatment_master", {
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
    tableName: "treatment_master",
    timestamps: true
});

// treatment_master.sync({ alter: true }).then(() => {
//     console.log("treatment_master model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing treatment_master model:", error);
// });

module.exports = treatment_master;