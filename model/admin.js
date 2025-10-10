const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");

const Admin = sequelize.define('admin', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    loginId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'compositeIndex'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'superadmin'),
        defaultValue: 'admin'
    },
       status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    token: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: null
    },
    updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: null
    }
});


// Admin.sync({alter:true}).then(() => {
//     console.log('Admin model synced successfully');
// }).catch((error) => {
//     console.error('Error syncing Admin model:', error);
// });

module.exports = Admin;
