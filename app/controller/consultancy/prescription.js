const { Op, where,col } = require("sequelize");
const CityMaster = require("../../model/city_master");
const Helper = require("../../helper/helper");
const Doctor = require("../../model/doctor");
const DoctorSlot = require("../../model/doctor_slots");
const moment = require("moment");
const speclization = require("../../model/specilization");
const DoctorConsultationBooking = require("../../model/booking");
const clinic = require("../../model/clinic");
const Qualification = require("../../model/qualification");

const sequelize = require("../../connection/connection");
const prescriptions = require("../../model/prescription");
const prescription_medicines = require("../../model/prescription_medicines");
const TblMedicine = require("../../model/medicine");
const { bookConsultancy } = require("../admin/public");
const registered_user = require("../../model/registeredusers");

exports.addPrescription = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      booking_id,
      prakriti_assessment,
      notes,
      medicines,
      doctor_id,
      user_id,
      diagnosis
    } = req.body;
    console.log(req.body);
    

    if (!booking_id || !Array.isArray(medicines) || !medicines.length) {
      return Helper.response(false, "Invalid payload", {}, res, 400);
    }

    // Create prescription header
    const prescription = await prescriptions.create(
      {
        booking_id,
        user_id,
        doctor_id: req.users.id,
        prakriti_assessment,
        notes,
        diagnosis,
      },
      { transaction: t }
    );

    // Prepare medicine rows
    const medicineRows = medicines.map((med) => ({
      prescription_id: prescription.id,
      booking_id,
      medicine_id: med.medicine_id,
      doctor_id: req.users?.id,
      strength: med.strength || null,
      form: med.form,
      dose: med.dose,
      frequency: med.frequency,
      route: med.route || "ORAL",
      duration: med.duration,
      food_timing: med.food_timing || null,
      instructions: med.instructions || null,
    }));

    await prescription_medicines.bulkCreate(medicineRows, {
      transaction: t,
    });
      
    const UpdateBooking = await DoctorConsultationBooking.update(
  {
    status: 'completed',
  },
  {
    where: {
      booking_id: booking_id,
    },
    transaction: t,  
  }
);

    await t.commit();

    return Helper.response(
      true,
      "Prescription added successfully",
      { prescription_id: prescription.id },
      res,
      200
    );
  } catch (error) {
    console.error("Add Prescription Error:", error);
    await t.rollback();
    
    return Helper.response(false, error.message, {}, res, 500);
  }
};




exports.addAllUserPrescription = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let {
      booking_id,
      prakriti_assessment,
      notes,
      medicines,
      user_id,
      diagnosis,
      patient_name,
      mobile,
      gender,
      age,
      is_walkin
    } = req.body;

    if (!Array.isArray(medicines) || medicines.length === 0) {
      return Helper.response(false, "Medicines are required", {}, res, 400);
    }

    let finalUserId = user_id;
    let finalBookingId = booking_id;

    /* ---------------------------------
       STEP 1: CREATE USER IF user_id = 0
    ---------------------------------- */
    if (user_id === 0) {
      if (!patient_name || !mobile) {
        return Helper.response(
          false,
          "Patient name and mobile required for walk-in",
          {},
          res,
          400
        );
      }

      // Avoid duplicate mobile users
      const existingUser = await registered_user.findOne({
        where: { mobile },
        transaction: t,
      });

      if (existingUser) {
        finalUserId = existingUser.id;
      } else {
        const newUser = await registered_user.create(
          {
            first_name: patient_name,
            mobile,
            gender,
            type: "walkin",
            isMobile_verified: true,
          },
          { transaction: t }
        );
        finalUserId = newUser.id;
      }
    }

    /* ---------------------------------
       STEP 2: CREATE BOOKING IF EMPTY
    ---------------------------------- */
    if (!booking_id) {
      finalBookingId = `BOOK-${Date.now()}`;

      await DoctorConsultationBooking.create(
        {
          booking_id: finalBookingId,
          user_id: finalUserId,
          doctor_id: req.users.id,
          name: patient_name,
          mobile,
          gender,
          age,
          type: "walkin",
          slot_date: new Date(),
          slot_time: "Walk-in",
          status: "completed",
        },
        { transaction: t }
      );
    }

    /* ---------------------------------
       STEP 3: CREATE PRESCRIPTION
    ---------------------------------- */
    const prescription = await prescriptions.create(
      {
        booking_id: finalBookingId,
        user_id: finalUserId,
        doctor_id: req.users.id,
        prakriti_assessment,
        notes,
        diagnosis,
      },
      { transaction: t }
    );

    /* ---------------------------------
       STEP 4: ADD MEDICINES
    ---------------------------------- */
    const medicineRows = medicines.map((med) => ({
      prescription_id: prescription.id,
      booking_id: finalBookingId,
      medicine_id: med.medicine_id,
      doctor_id: req.users.id,
      strength: med.strength || null,
      form: med.form,
      dose: med.dose,
      frequency: med.frequency,
      route: med.route || "ORAL",
      duration: med.duration,
      food_timing: med.food_timing || null,
      instructions: med.instructions || null,
    }));

    await prescription_medicines.bulkCreate(medicineRows, {
      transaction: t,
    });

    /* ---------------------------------
       STEP 5: UPDATE BOOKING STATUS
    ---------------------------------- */
    await DoctorConsultationBooking.update(
      { status: "completed" },
      {
        where: { booking_id: finalBookingId },
        transaction: t,
      }
    );

    await t.commit();

    return Helper.response(
      true,
      "Prescription added successfully",
      {
        prescription_id: prescription.id,
        booking_id: finalBookingId,
        user_id: finalUserId,
      },
      res,
      200
    );
  } catch (error) {
    await t.rollback();
    console.error("Add Prescription Error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};


exports.prescriptionList=async(req,res)=>{
  try {

    const id=req.users.id

    const getPrescription=await prescriptions.findAll({
      where:{
        doctor_id:id
      },
      raw:true,
      order:[["id","desc"]]
    })
    if(getPrescription.length==0){
      return Helper.response(false,"No Data Found",[],res,200)
    }
    return Helper.response(false,"Data Found Successfully",getPrescription,res,200)

  } catch (error) {
    console.error("prescription List Error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
}
exports.medicineDD = async (req, res) => {
  try {
    const { search } = req.body;
 
    let whereCondition = {};
 
    if (search) {
      whereCondition.MedicineName = {
        [Op.iLike]: `%${search}%`,
      };
    }
 
    const medicine = await TblMedicine.findAll({
      attributes: [
        [col("Id"), "value"],
        [col("MedicineName"), "label"],
        [col("Packing"), "strength"],
        [col("Type"), "type"],
        "MRP",
      ],
      where: whereCondition,
      order: [["Id", "DESC"]],
      raw: true,
     
    });
 
    if (!medicine.length) {
      return Helper.response(true, "No Data Found", [], res, 200);
    }
 
    return Helper.response(
      true,
      "Data Found Successfully",
      medicine,
      res,
      200
    );
  } catch (error) {
    console.error("Medicine Dropdown Error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

// exports.medicineDD = async (req, res) => {
//   try {
//     const { search } = req.body;

//     let whereCondition = {};

//     if (search) {
//       whereCondition.MedicineName = {
//         [Op.iLike]: `%${search}%`,
//       };
//     }

//     const medicine = await TblMedicine.findAll({
//       attributes: [
//         [col("Id"), "value"],
//         [col("MedicineName"), "label"],
//         [col("Packing"), "strength"],
//         "MRP",
//       ],
//       where: whereCondition,
//       order: [["Id", "DESC"]],
//       raw: true,
     
//     });

//     if (!medicine.length) {
//       return Helper.response(true, "No Data Found", [], res, 200);
//     }

//     return Helper.response(
//       true,
//       "Data Found Successfully",
//       medicine,
//       res,
//       200
//     );
//   } catch (error) {
//     console.error("Medicine Dropdown Error:", error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };


exports.getPrescriptionDetails = async (req, res) => {
  try {
    const { booking_id } = req.body;
    if (!booking_id) {
      return Helper.response(false, "Booking ID is required", {}, res, 400);
    } 
    let prescription = await prescriptions.findOne({
      where: { booking_id: booking_id },
      raw: true,
    });
    if (!prescription) {
      return Helper.response(false, "Prescription not found", {}, res, 404);
    }

    const patient_name = await DoctorConsultationBooking.findOne({
      where: { booking_id: booking_id },
      attributes: ["mobile","name"],
      raw: true,
    });
    prescription.patient_name = patient_name.name;
    prescription.patient_mobile = patient_name.mobile;

    const medicines = await prescription_medicines.findAll({  
      where: { booking_id: booking_id },
      raw: true,
    });
    return Helper.response(
      true,
      "Prescription details fetched successfully",  
      { prescription, medicines },
      res,
      200
    );
  } 
  catch (error) {
    console.error("Get Prescription Details Error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.updatebookingStatus = async (req, res) => {
  try {
    // 1. Extract token
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return Helper.response(false, "Authorization token missing", {}, res, 401);
    }

    // 2. Identify who joined
    let is_user_join;
    let is_doctor_join;

    const usertoken = await registered_user.findOne({ where: { token } });
    if (usertoken) {
      is_user_join = true;
    } else {
      const doctorToken = await Doctor.findOne({ where: { token } });
      if (doctorToken) {
        is_doctor_join = true;
      }
    }

    if (!is_user_join && !is_doctor_join) {
      return Helper.response(false, "Invalid token", {}, res, 401);
    }

    // 3. Validate request body
    const { booking_id, status } = req.body;

    if (!booking_id) {
      return Helper.response(false, "booking_id is required", {}, res, 400);
    }

    // 4. Prepare update payload
    const updatePayload = {
      is_user_join,
      is_doctor_join,
    };

    if (status) {
      updatePayload.status = status;
    }

    // 5. Update booking
    const [updatedCount] = await DoctorConsultationBooking.update(
      updatePayload,
      {
        where: { booking_id },
      }
    );

    if (updatedCount === 0) {
      return Helper.response(false, "Booking not found", {}, res, 404);
    }

    return Helper.response(
      true,
      "Booking status updated successfully",
      updatePayload,
      res,
      200
    );
  } catch (error) {
    console.error("Update Booking Status Error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

