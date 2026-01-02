const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const DoctorConsultationBooking = require("./booking");

const prescriptions = sequelize.define(
 "prescriptions",{
    booking_id: DataTypes.STRING,
    doctor_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    patient_name: DataTypes.STRING,
    prakriti_assessment: DataTypes.BOOLEAN,
    notes: DataTypes.TEXT,
    diagnosis: DataTypes.TEXT,
  },
 {
    tableName: 'prescriptions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

// prescriptions.belongsTo(DoctorConsultationBooking, {
//   foreignKey: "booking_id",
//   as: "booking",
// });

// prescriptions.sync({ alter: true })
//   .then(() => console.log("prescriptions synced"))
//   .catch(console.error);
  
module.exports = prescriptions;
