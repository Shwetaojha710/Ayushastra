const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const prescriptions = require("./prescription");

const DoctorConsultationBooking = sequelize.define("bookings", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    clinic_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

    type: {
        type: DataTypes.STRING,
        allowNull: true,   // online/offline
    },

    slot_date: {
        type: DataTypes.DATEONLY,   // YYYY-MM-DD
        allowNull: false,
    },

    slot_time: {
        type: DataTypes.STRING,     // 02:12 AM
        allowNull: false,
    },

    slot_raw: {
        type: DataTypes.JSONB,
        allowNull: true,
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    mobile: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    gender: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    dob: {
        type: DataTypes.DATEONLY, // YYYY-MM-DD
        allowNull: true,
    },

    age: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

    disease: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    symptom: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    previous_medicine: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    is_doctor_join: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    is_user_join: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },

    medicine_details: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    prescription_img: {
    type: DataTypes.JSON,   // stores ["img1.jpg","img2.png"]
    allowNull: true
    },

    booking_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    user_id:{
        type: DataTypes.INTEGER,
        allowNull:false
    },
    status:{
        type: DataTypes.ENUM('pending','completed','cancelled','started'),
        allowNull:false,
        defaultValue:'pending'
    }

}, {
    tableName: "bookings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

// DoctorConsultationBooking.hasMany(prescriptions, {
//   foreignKey: "booking_id",
//   as: "prescriptions",
// });


// DoctorConsultationBooking.sync({alter:true}).then(() => {
//     console.log("speclization model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing speclization model:", error);
// });

module.exports = DoctorConsultationBooking;
