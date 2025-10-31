const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");

const Consultancy = sequelize.define(
  "consultancy",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
   
    email:{
        type: DataTypes.STRING,
        allowNull: false,
    },
   
    mobile: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    consult_purpose: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    details: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    previous_disease: {
      type: DataTypes.STRING,
      allowNull: true,
    },
     image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
     booking_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
     booking_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "consultancy",
    timestamps: false,
  }
);

// Consultancy.sync({ alter: true })
//   .then(() => {
//     console.log("consultancy model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing consultancy model:", error);
//   });

module.exports = Consultancy;
