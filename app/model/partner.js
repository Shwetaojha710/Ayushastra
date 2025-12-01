const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const Partner = sequelize.define(
  "Partner",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },

    mobile: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },

    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    terms: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      defaultValue: "Pending",
    },
  },
  {
    tableName: "partners",
    timestamps: true,
  }
);

// Partner.sync({ alter: true })
//   .then(() => {
//     console.log("Partner model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing Partner model:", error);
//   });

module.exports = Partner;
