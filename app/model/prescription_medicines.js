const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const prescription_medicines = sequelize.define(
  "prescription_medicines",
  {
    booking_id:
    {
        type:  DataTypes.STRING,
        allowNull:false
    },
  
    doctor_id:
    {
         type:  DataTypes.INTEGER,
        allowNull:true
    },
    patient_name:{
         type:  DataTypes.STRING,
        allowNull:true
    },
    
    medicine_id:{
         type:  DataTypes.INTEGER,
        allowNull:false
    },
     
    strength:{
         type:  DataTypes.STRING,
        allowNull:true
    },
    form: {
         type: DataTypes.STRING,
        allowNull:true
    },
    dose:{
         type: DataTypes.STRING,
        allowNull:true
    },
    frequency:{
         type:  DataTypes.STRING,
        allowNull:true
    }, 
    route:
    {
         type:   DataTypes.STRING,
        allowNull:true
    },
   
    duration:{
         type:  DataTypes.STRING,
        allowNull:true
    },
    food_timing:{
         type:   DataTypes.STRING,
        allowNull:true
    },
    prescription_medicines:{
         type:   DataTypes.STRING,
        allowNull:true
    },
    instructions: {
         type: DataTypes.TEXT,
        allowNull:true
    },
    prakriti_assessment:{
         type:  DataTypes.BOOLEAN,
        allowNull:true
    }, 
    // notes:{
    //      type: DataTypes.TEXT,
    //     allowNull:false
    // }, 
  },
  {
    tableName: "prescription_medicines",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

// prescription_medicines.sync()
//   .then(() => console.log("prescription_medicines synced"))
//   .catch(console.error);

module.exports = prescription_medicines;
