const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");

 const Address = sequelize.define("Address", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement:true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mobile: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    address_line2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    postal_code: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: "India"
    },
    address_type: {
      type: DataTypes.STRING,
      defaultValue: "shipping"
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: "addresses",
    timestamps: true,
  });
// Address.sync({alter:true}).then(() => {
//     console.log('Address model synced successfully');
// }).catch((error) => {
//     console.error('Error syncing Address model:', error);
// });

module.exports = Address;