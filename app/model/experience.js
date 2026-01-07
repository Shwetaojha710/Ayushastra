const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const Doctor = require("./doctor");
const department = require("./department");
// const Doctor = require("./doctor");

const Experience = sequelize.define("experience", {
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
  organization: { type: DataTypes.STRING, allowNull: false },
  department_id: { type: DataTypes.INTEGER, allowNull: false },
  from_date: { type: DataTypes.DATEONLY, allowNull: false },
  to_date: { type: DataTypes.DATEONLY, allowNull: true },
  is_current: { type: DataTypes.BOOLEAN, allowNull: true,defaultValue:false  },
  status: { type: DataTypes.BOOLEAN, allowNull: true,defaultValue:true },
});

Doctor.hasMany(Experience, { foreignKey: "doctorId", onDelete: "CASCADE" });
Experience.belongsTo(Doctor, { foreignKey: "doctorId" });


// Experience.sync()
//   .then(() => {
//     console.log("Experience model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing Experience model:", error);
//   });
module.exports = Experience;
