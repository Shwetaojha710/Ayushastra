const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const DoctorChangeRequest = sequelize.define("doctor_change_requests", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  keys: {
    type: DataTypes.JSON,   // Example: ["pan", "aadhar_front"]
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending"
  },
});

//     DoctorChangeRequest.sync({alter:true}).then(() => {
//     console.log('DoctorChangeRequest model synced successfully');
// }).catch((error) => {
//     console.error('Error syncing DoctorChangeRequest model:', error);
// });


module.exports = DoctorChangeRequest;
