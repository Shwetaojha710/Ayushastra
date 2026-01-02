const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const Doctor = require("./doctor");
// const Doctor = require("./doctor");

const Qualification = sequelize.define("qualification", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "doctors", key: "id" },
    onDelete: "CASCADE",
  },
  degree: { type: DataTypes.STRING, allowNull: false },
  passing_year: { type: DataTypes.DATEONLY, allowNull: false },
  university: { type: DataTypes.STRING, allowNull: false },
  certificate_no: { type: DataTypes.STRING, allowNull: true },
  certificate: { type: DataTypes.STRING, allowNull: true },
  certificate_type: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.BOOLEAN, allowNull: true,defaultValue:true },
});

Doctor.hasMany(Qualification, { foreignKey: "doctorId", onDelete: "CASCADE" });
Qualification.belongsTo(Doctor, { foreignKey: "doctorId" });


// Qualification.sync()
//   .then(() => {
//     console.log("Qualification model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing Qualification model:", error);
//   });
module.exports = Qualification;
