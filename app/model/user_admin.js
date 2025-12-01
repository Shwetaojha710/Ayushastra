const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const user_admin = sequelize.define("user_admin", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    parent_id: { type: DataTypes.INTEGER, allowNull: true },
    monthly_purchase: { type: DataTypes.FLOAT, defaultValue: 0 } // purchase in current month
  },
   { tableName: 'user_admin' ,
     timestamps: true
  });


// user_admin.sync({alter:true}).then(() => {
//     console.log('user_admin model synced successfully');
// }).catch((error) => {
//     console.error('Error syncing user_admin model:', error);
// });

module.exports = user_admin;
