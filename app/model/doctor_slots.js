const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const DoctorSlot = sequelize.define('DoctorSlot', {
    id: { type: DataTypes.INTEGER, primaryKey: true,autoIncrement:true },
    doctorId: { type: DataTypes.INTEGER, allowNull: false },
    day: { type: DataTypes.STRING, allowNull: false },
    session_type: { 
      type: DataTypes.ENUM('online', 'offline','online_audio'), 
      allowNull: false, 
      defaultValue: 'online' 
    },
    clinic_name: { type: DataTypes.STRING },
    clinic_address: { type: DataTypes.TEXT },
    start_time: { type: DataTypes.STRING, allowNull: false },
    end_time: { type: DataTypes.STRING, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false },
    fees: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
    emergency_fees: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    to_all_online: { type: DataTypes.BOOLEAN, defaultValue: false },
    sync: { type: DataTypes.BOOLEAN, defaultValue: false },
    pin_code: { type: DataTypes.STRING, allowNull: true },
    clinic_image_2: { type: DataTypes.STRING, allowNull: true },
    clinic_image_1: { type: DataTypes.STRING, allowNull: true },
    whatsApp: { type: DataTypes.STRING, allowNull: true },
  }, {
    tableName: 'doctor_slots',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });



// DoctorSlot
//   .sync({ alter: true })
//   .then(() => {
//     console.log("DoctorSlot model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing DoctorSlot model:", error);
//   });

module.exports = DoctorSlot;
