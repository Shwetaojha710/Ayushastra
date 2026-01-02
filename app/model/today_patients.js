const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const TodayPatient = sequelize.define(
  "today_patient",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    mobile: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },

    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: true,
    },

    visit_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    is_prescription_added: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "today_patients",
    timestamps: true,
  }
);

// TodayPatient.sync({alter: true})
//   .then(() => {
//     console.log("TodayPatient model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing TodayPatient model:", error);
//   });

module.exports = TodayPatient;
