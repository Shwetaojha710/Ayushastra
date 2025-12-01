const { DataTypes } = require("sequelize");
const sequelize = require('../connection/connection');

const Diseases = sequelize.define("diseases", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    doc_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
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
    },
}, {
    tableName: "diseases",
    timestamps: true
});

// Diseases.sync({ alter: true }).then(() => {
//     console.log("Diseases model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing Diseases model:", error);
// });

module.exports = Diseases;