const { Op, col } = require("sequelize");
const CityMaster = require("../../model/city_master");
const Helper = require("../../helper/helper");
const Doctor = require("../../model/doctor");
const DoctorSlot = require("../../model/doctor_slots");
const moment = require("moment");
const speclization = require("../../model/specilization");
const DoctorConsultationBooking = require("../../model/booking");
const clinic = require("../../model/clinic");
const Qualification = require("../../model/qualification");
const Experience = require("../../model/experience");
const department = require("../../model/department");
// const department = require("../../model/department");

exports.getCity = async (req, res) => {
  const city = req.body.city_name.toUpperCase();
  try {
    const cityData = await CityMaster.findAll({
      where: {
        city_name: { [Op.iLike]: `%${city}%` },
      },
    });
    const data = cityData.map((item) => {
      return {
        value: item.id,
        label: item.city_name,
      };
    });
    return Helper.response(true, "City List", data, res, 200);
  } catch (error) {
    console.log(error);
    return Helper.response(false, "error", error, res, 500);
  }
};

exports.getDoctorByFilter = async (req, res) => {
  const { specialization, city } = req.body;

  try {
    let whereClause = {
      status: true,
      KYCstatus: "approved",
    };

    if (specialization) {
      whereClause.speciality = {
        [Op.iLike]: `%${specialization}%`,
      };
    }

    if (city) {
      whereClause.cityId = {
        [Op.iLike]: `%${city}%`,
      };
    }

    const doctors = await Doctor.findAll({
      where: whereClause,
      raw: true,
      nest: true,
    });

    for (let doc of doctors) {
      let ids = doc.speciality;

      if (typeof ids === "string") {
        ids = ids.split(",").map((v) => Number(v.trim()));
      }
      console.log(ids);
      // return
      if (!Array.isArray(ids)) {
        ids = [ids];
      }

      const clinics = await clinic.findAll({
        where: {
          doctor_id: doc?.id,
        },
        attributes: [
          "id",
          "clinic_name",
          "clinic_address",
          "fees",
          "emergency_fees",
          "pin_code",
          "clinic_image_2",
          "clinic_image_1",
        ],
        raw: true,
      });

      const qualification = await Qualification.findAll({
        where: {
          doctorId: doc?.id,
        },
        attributes: [
          "id",
          "doctorId",
          "degree",
          "passing_year",
          "university",
          "certificate_no",
          "certificate",
          "certificate_type",
          "status",
        ],
        raw: true,
      });

      let exp = await Experience.findAll({
        where: {
          doctorId: doc?.id,
        },
        attributes: [
          "id",
          "doctorId",
          "organization",
          "department_id",
          "from_date",
          "to_date",
          "is_current",
          "status",
        ],
        raw: true,
      });

      exp = await Promise.all(
        exp.map(async (item) => {
          const departments = await department.findOne({
            where: {
              id: item.department_id,
            },
            attributes: [
              [col("id"), "value"],
              [col("name"), "lable"],
            ],
            raw: true,
          });
          return {
            ...item,
            department: departments,
          };
        })
      );

      const spec =
        ids && ids.length > 0
          ? await speclization.findAll({
              where: {
                id: { [Op.in]: ids },
              },
              attributes: ["id", "name"],
              raw: true,
            })
          : null;

      doc.speciality_names = spec.map((s) => s.name);
      doc.clinic = clinics;
      doc.qualification = qualification;
      doc.exp = exp;
    }

    return Helper.response(true, "Doctor List", doctors, res, 200);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return Helper.response(false, error?.message, error, res, 500);
  }
};

exports.getDoctorInfo = async (req, res) => {
  try {
    const doctor_id = req.body?.doctor_id ?? req.users?.id;
    const doc = await Doctor.findOne({ where: { id: doctor_id } });

    let ids = doc.speciality;

    if (typeof ids === "string") {
      ids = ids.split(",").map((v) => Number(v.trim()));
    }
    console.log(ids);
    // return
    if (!Array.isArray(ids)) {
      ids = [ids];
    }

    const clinics = await clinic.findAll({
      where: {
        doctor_id: doc?.id,
      },
      attributes: [
        "id",
        "clinic_name",
        "clinic_address",
        "fees",
        "emergency_fees",
        "pin_code",
        "clinic_image_2",
        "clinic_image_1",
      ],
      raw: true,
    });

    const qualification = await Qualification.findAll({
      where: {
        doctorId: doc?.id,
      },
      attributes: [
        "id",
        "doctorId",
        "degree",
        "passing_year",
        "university",
        "certificate_no",
        "certificate",
        "certificate_type",
        "status",
      ],
      raw: true,
    });

    let exp = await Experience.findAll({
      where: {
        doctorId: doc?.id,
      },
      attributes: [
        "id",
        "doctorId",
        "organization",
        "department_id",
        "from_date",
        "to_date",
        "is_current",
        "status",
      ],
      raw: true,
    });

    exp = await Promise.all(
      exp.map(async (item) => {
        const departments = await department.findOne({
          where: {
            id: item.department_id,
          },
          attributes: [
            [col("id"), "value"],
            [col("name"), "lable"],
          ],
          raw: true,
        });
        return {
          ...item,
          department: departments,
        };
      })
    );

    const spec =
      ids && ids.length > 0
        ? await speclization.findAll({
            where: {
              id: { [Op.in]: ids },
            },
            attributes: ["id", "name"],
            raw: true,
          })
        : null;

    doc.speciality_names = spec.map((s) => s.name);
    doc.clinic = clinics;
    doc.qualification = qualification;
    doc.exp = exp;

    return Helper.response(true, "Doctor Info", doc, res, 200);
  } catch (error) {
    console.error("Error fetching doctor info:", error);
    return Helper.response(false, "error", error, res, 500);
  }
};

// exports.getDoctorConsultationSlots = async (req, res) => {
//   try {
//     const doctorId = req.body.doctor_id;
//     const type = req.body.type || "offline"; // online, offline, online_audio
//     const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
//     // Fetch doctor
//     let doctor = await Doctor.findOne({ where: { id: doctorId }, raw: true });
//     if (!doctor) {
//       return Helper.response(false, "Doctor not found", null, res, 404);
//     }

//     const slots = await DoctorSlot.findAll({
//       where: {
//         doctor_id: doctorId,
//       },
//       raw: true,
//     });
//     const clinics = await clinic.findAll({
//       where: { doctor_id: doctorId },
//       attributes: ["id", "clinic_name", "clinic_address", "fees"],
//       raw: true,
//     });
//     let specilityIds = Helper.parseIds(doctor.speciality);

//     doctor.speciality = await speclization.findAll({
//       where: {
//         id: {
//           [Op.in]: specilityIds.length ? specilityIds : [0],
//         },
//       },
//       attributes: [
//         ["id", "value"],
//         ["name", "label"],
//       ],
//       order: [["id", "DESC"]],
//       raw: true,
//     });

//     // Generate next 7 days
//     const dates = [];
//     const slotsByDate = {};

//     for (let i = 0; i < 7; i++) {
//       const dateObj = moment().add(i, "days");
//       const key = dateObj.format("D-MMM");

//       dates.push({
//         day: dateObj.format("ddd"),
//         date: dateObj.format("D"),
//         month: dateObj.format("MMM"),
//       });

//       slotsByDate[key] = {
//         morning: [],
//         afternoon: [],
//         evening: [],
//         morning_count: 0,
//         afternoon_count: 0,
//         evening_count: 0,
//       };
//     }

//     // Convert DB slots (day based) → date based
//     slots.forEach(async (slot) => {
//       for (let i = 0; i < 7; i++) {
//         const dateObj = moment().add(i, "days");
//         const dayName = dateObj.format("dddd").toLowerCase();
//         const key = dateObj.format("D-MMM");

//      if (slot.day.toLowerCase() == dayName) {
//           const start = moment(slot.start_time, "HH:mm");
//           const end = moment(slot.end_time, "HH:mm");
//           const duration = slot.duration || 15;

//           while (start.isBefore(end)) {
//             const slotTime = start.clone();
//             const formattedTime = slotTime.format("hh:mm A");

//             // Categorize time
//             const hour = slotTime.hour();

//             let category = "";

//             if (hour < 12) {
//               category = "morning";
//             } else if (hour >= 12 && hour < 17) {
//               category = "afternoon";
//             } else {
//               category = "evening";
//             }

//             slotsByDate[key][category].push({
//               time: formattedTime,
//               available: true,
//               session_type: slot.session_type,
//               clinic_name: slot.clinic_name,
//               clinic_address: slot.clinic_address,
//               clinic_image_1: slot.clinic_image_1,
//               clinic_image_2: slot.clinic_image_2,
//               pin_code: slot.pin_code,
//               whatsApp: slot.whatsApp,
//               fees: slot.fees,
//               emergency_fees: slot.emergency_fees,
//               duration: slot.duration,
//             });

//             start.add(duration, "minutes");
//           }
//         }

//       }
//     });

//     // Add counts
//     Object.keys(slotsByDate).forEach((key) => {
//       slotsByDate[key].morning_count = slotsByDate[key].morning.length;
//       slotsByDate[key].afternoon_count = slotsByDate[key].afternoon.length;
//       slotsByDate[key].evening_count = slotsByDate[key].evening.length;
//     });

//     // Build response
//     const doctorInfo = {
//       doctor: {
//         name: doctor.name,
//         experience: doctor.experience || "N/A",
//         specialization: doctor.speciality,
//         profileImage: doctor.profileImage || null,
//       },
//       facility: {
//         name: doctor.clinic_name || "Ayu Clinic",
//         address: doctor.address,
//         map: "https://maps.google.com/?q=" + doctor.address,
//       },
//       consultation: {
//         fee: `₹${doctor.consultancyCharge || 0}`,
//         duration: "20 mins",
//         description: "Visit doctor / online consultation",
//       },
//       dates,
//       slotsByDate,
//       clinics,
//     };

//     return Helper.response(true, "Doctor Info", doctorInfo, res, 200);
//   } catch (err) {
//     console.error("Error fetching doctor consultation slots:", err);
//     return Helper.response(false, err.message, null, res, 500);
//   }
// };

exports.getDoctorConsultationSlots = async (req, res) => {
  try {
    const doctorId = req.body.doctor_id;
    const type = req.body?.type;

    if (!doctorId) {
      return Helper.response(false, "doctor id is required", null, res, 400);
    }

    const doctor = await Doctor.findOne({ where: { id: doctorId }, raw: true });
    if (!doctor) {
      return Helper.response(false, "Doctor not found", null, res, 404);
    }

    // const slots = await DoctorSlot.findAll({
    //   where: { doctor_id: doctorId, session_type: type },
    //   raw: true,
    // });
    let whereCondition = { doctor_id: doctorId };

    // if (type) {
    //     whereCondition.session_type = type;
    // }

    // let fees=type=="online_consultant"?doctor?.online_consultation_fees:doctor?.appointmentCharge

    const slots = await DoctorSlot.findAll({
      where: whereCondition,
      raw: true,
    });
    const clinics = await clinic.findAll({
      where: { doctor_id: doctorId },
      attributes: ["id", "clinic_name", "clinic_address", "fees"],
      raw: true,
    });

    let specilityIds = Helper.parseIds(doctor.speciality);
    doctor.speciality = await speclization.findAll({
      where: { id: { [Op.in]: specilityIds.length ? specilityIds : [0] } },
      attributes: [
        ["id", "value"],
        ["name", "label"],
      ],
      order: [["id", "DESC"]],
      raw: true,
    });

    const dates = [];
    const slotsByDate = {};

    for (let i = 0; i < 7; i++) {
      const d = moment().add(i, "days");
      const key = d.format("YYYY-MM-DD");
      const dateObj = moment().add(i, "days");
      const key1 = dateObj.format("D-MMM");

      dates.push({
        day: dateObj.format("ddd"),
        date: dateObj.format("D"),
        month: dateObj.format("MMM"),
      });

      slotsByDate[key1] = {
        morning: [],
        afternoon: [],
        evening: [],
        morning_count: 0,
        afternoon_count: 0,
        evening_count: 0,
      };
    }

    const next7Dates = Object.keys(slotsByDate);
    const existingBookings = await DoctorConsultationBooking.findAll({
      where: { doctor_id: doctorId },
      raw: true,
      attributes: ["slot_date", "slot_time"],
    });

    const bookedMap = {};
    existingBookings.forEach((b) => {
      bookedMap[`${b.slot_date}_${b.slot_time}`] = true;
    });

    // Build slots for each date
    for (const slot of slots) {
      for (let i = 0; i < 7; i++) {
        const d = moment().add(i, "days");
        const slotDay = d.format("dddd").toLowerCase();
        const key = d.format("YYYY-MM-DD");
        const dateObj = moment().add(i, "days");
        const key1 = dateObj.format("D-MMM");
        if (slot.day.toLowerCase() !== slotDay) continue;

        const start = moment(slot.start_time, "HH:mm");
        const end = moment(slot.end_time, "HH:mm");
        const duration = slot.duration || 15;

        while (start < end) {
          const formattedTime = start.format("hh:mm A");
          const hr = start.hour();

          let category =
            hr < 12 ? "morning" : hr < 17 ? "afternoon" : "evening";

          const slotKey = `${key}_${formattedTime}`;

          const available = bookedMap[slotKey] ? false : true;

          slotsByDate[key1][category].push({
            time: formattedTime,
            available,
            session_type: slot.session_type,
            clinic_name: slot.clinic_name,
            clinic_address: slot.clinic_address,
            clinic_image_1: slot.clinic_image_1,
            clinic_image_2: slot.clinic_image_2,
            pin_code: slot.pin_code,
            whatsApp: slot.whatsApp,
            fees: slot.fees,
            emergency_fees: slot.emergency_fees,
            duration: slot.duration,
            slot_date: key,
          });

          start.add(duration, "minutes");
        }
      }
    }

    Object.keys(slotsByDate).forEach((key) => {
      slotsByDate[key].morning_count = slotsByDate[key].morning.length;
      slotsByDate[key].afternoon_count = slotsByDate[key].afternoon.length;
      slotsByDate[key].evening_count = slotsByDate[key].evening.length;
    });

    // Final response
    const doctorInfo = {
      doctor: {
        name: doctor.name,
        experience: doctor.experience || "N/A",
        specialization: doctor.speciality,
        profileImage: doctor.profileImage || null,
        appointmentCharge: doctor.appointmentCharge || null,
        online_consultation_fees: doctor.online_consultation_fees || null,
      },
      facility: {
        name: doctor.clinic_name || "Ayu Clinic",
        address: doctor.address,
        map: "https://maps.google.com/?q=" + doctor.address,
      },
      consultation: {
        fee: `₹${doctor.consultancyCharge || 0}`,
        duration: "20 mins",
        description: "Visit doctor / online consultation",
      },
      dates,
      slotsByDate,
      clinics,
    };

    return Helper.response(true, "Doctor Info", doctorInfo, res, 200);
  } catch (err) {
    console.error("Error fetching doctor consultation slots:", err);
    return Helper.response(false, err.message, null, res, 500);
  }
};

exports.createConsultationBooking = async (req, res) => {
  try {
    const {
      doctor_id,
      type,
      slot_date,
      slot_time,
      name,
      mobile,
      gender,
      dob,
      age,
      disease,
      has_previous_medicine,
      medicine_details,
      symptom,
      clinic_id,
      medical_conditions,
    } = req.body;

    if (!doctor_id) {
      return Helper.response(false, "Doctor Id is required", null, res, 400);
    }
    console.log(doctor_id);
    const ExistsDoctor = await Doctor.findOne({
      where: {
        id: doctor_id,
      },
    });
    if (!ExistsDoctor) {
      return Helper.response(false, "No data Found", null, res, 400);
    }
    let slot_raw = null;
    if (req.body.slot_raw) {
      slot_raw = JSON.parse(req.body.slot_raw);
    }

    let prescription_img = [];

    if (req.files && req.files.prescription_img) {
      prescription_img = req.files.prescription_img.map(
        (file) => file.filename
      );
    } else if (req.body.prescription_img) {
      try {
        const arr = JSON.parse(req.body.prescription_img);
        prescription_img = arr.map((img) => img.uri);
      } catch (error) {
        prescription_img = [];
      }
    }

    // const formattedDate = moment(slot_date, "D-MMM").format("YYYY-MM-DD");

    const previous_medicine = has_previous_medicine === "yes";

    // let prescription_img = null;
    // if (req.files) {
    //   prescription_img = req.files.filename;
    // }

    const ExitsData = await DoctorConsultationBooking.findOne({
      where: {
        slot_date: slot_date,
        slot_time,
        doctor_id,
        status: "pending",
      },
    });
    if (ExitsData) {
      return Helper.response(false, "Data already exists", {}, res, 200);
    }

    // const booking_id = "BOOK-" + Date.now();
    const booking_id = Helper.generateConsultationBookingId(type);
    const booking = await DoctorConsultationBooking.create({
      doctor_id: parseInt(doctor_id),
      type,
      slot_date: slot_date,
      slot_time,
      slot_raw,
      name,
      mobile,
      gender,
      dob,
      clinic_id,
      age: Number(age),
      disease: disease || medical_conditions,
      previous_medicine,
      prescription_img,
      booking_id,
      symptom,
      medicine_details: medicine_details ?? null,
      user_id: req.users.id,
    });

    return Helper.response(
      true,
      "Booking Created Successfully",
      booking,
      res,
      200
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return Helper.response(false, error?.message, error, res, 500);
  }
};


exports.getDoctorProfile = async (req, res) => {
  try {
    let doctor_id = req.body?.doctor_id ?? req.users?.id;
    if (!doctor_id && doctor_id != 0) {
      const authHeader =
        req.headers["authorization"] || req.headers["Authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      if (!token) {
        return Helper.response(false, "Token not provided", {}, res, 200);
      }
      const decoded = await Helper.verifyToken(token);
      if (!decoded) {
        return Helper.response("expired", "Invalid token", {}, res, 200);
      }
      const user = await Doctor.findOne({ where: { id: decoded.id } });
      if (!user) {
        return Helper.response(false, "User not found", {}, res, 200);
      }
      if (user.token !== token) {
        return Helper.response(
          "expired",
          "Token Expired due to another login, Login Again!",
          {},
          res,
          200
        );
      }
      doctor_id = await Doctor.findOne({
        where: { id: user?.id },
        attributes: ["id"],
        raw: true,
      }).then((data) => data?.id);
    }
    if (!doctor_id) {
      return Helper.response(false, "Id is required", {}, res, 200);
    }
    const doctorInfo = await Doctor.findOne({
      where: { id: doctor_id },
      raw: true,
    });
    const qualifications = await Qualification.findAll({
      where: { doctorId: doctorInfo?.id, status: true },
      raw: true,
    });
    const clinicDetailsOffline = await clinic.findAll({
      where: { doctorId: doctorInfo?.id, session_type: "offline" },
      raw: true,
      order: [["created_at", "desc"]],
    });

    const experiences = await Experience.findAll({
      where: { doctorId: doctorInfo?.id, status: true },
      raw: true,
    });
    const doctorSlot = await DoctorSlot.findAll({
      where: { doctor_id: doctorInfo?.id },
      raw: true,
    });
    const onlineSlot = await DoctorSlot.findAll({
      where: { doctor_id: doctorInfo?.id, session_type: "online" },
      raw: true,
    });

    const clinicWiseSlots = clinicDetailsOffline.map((clinic) => {
      return {
        ...clinic,
        slots: doctorSlot.filter((slot) => slot.clinic_id == clinic.id),
      };
    });

    const specialityId = Helper.parseIds(doctorInfo?.speciality);
    const specialitys = await speclization.findAll({
      where: { id: { [Op.in]: specialityId } },
      attributes: [
        ["id", "value"],
        ["name", "label"],
      ],
      order: [["id", "DESC"]],
      raw: true,
    });
    return Helper.response(
      true,
      "Doctor Info",
      {
        ...doctorInfo,
        specialitys,
        qualifications,
        experiences,
        clinicWiseSlots,
        onlineSlot,
      },
      res,
      200
    );
  } catch (error) {
    console.error("Error fetching doctor info:", error);
    return Helper.response(false, error?.message, error, res, 500);
  }
};


// exports.getDoctorProfile = async (req, res) => {
//   try {
//     let doctor_id = req.body?.doctor_id ?? req.users?.id;
//     if (!doctor_id && doctor_id != 0) {
//       const authHeader =
//         req.headers["authorization"] || req.headers["Authorization"];
//       const token = authHeader && authHeader.split(" ")[1];

//       if (!token) {
//         return Helper.response(false, "Token not provided", {}, res, 200);
//       }

//       const decoded = await Helper.verifyToken(token);
//       if (!decoded) {
//         return Helper.response("expired", "Invalid token", {}, res, 200);
//       }

//       const user = await Doctor.findOne({ where: { id: decoded.id } });

//       if (!user) {
//         return Helper.response(false, "User not found", {}, res, 200);
//       }

//       if (user.token !== token) {
//         return Helper.response(
//           "expired",
//           "Token Expired due to another login, Login Again!",
//           {},
//           res,
//           200
//         );
//       }

//       doctor_id = await Doctor.findOne({
//         where: {
//           id: user?.id,
//         },
//         attributes: ["id"],
//         raw: true,
//       }).then((data) => data?.id);
//     }

//     if (!doctor_id) {
//       return Helper.response(false, "Id is required", {}, res, 200);
//     }

//     const doctorInfo = await Doctor.findOne({
//       where: { id: doctor_id },
//       raw: true,
//     });

//     const qualifications = await Qualification.findAll({
//       where: {
//         doctorId: doctorInfo?.id,
//         status: true,
//       },
//       raw: true,
//     });

//     const clinicDetailsOffline = await clinic.findAll({
//       where: {
//         doctorId: doctorInfo?.id,
//         session_type: "offline",
//       },
//       raw: true,
//       order: [["created_at", "desc"]],
//     });

//     const experiences = await Experience.findAll({
//       where: {
//         doctorId: doctorInfo?.id,
//         status: true,
//       },
//       raw: true,
//     });

//     const doctorSlot = await DoctorSlot.findAll({
//       where: {
//         doctor_id: doctorInfo?.id,
//       },
//       raw: true,
//     });

//      const onlineSlot = await DoctorSlot.findAll({
//       where: {
//         doctor_id: doctorInfo?.id,
//         session_type: 'online',
//       },
//       raw: true,
//     });

//     const clinicWiseSlots = clinicDetailsOffline.map(clinic => {
//       return {
//         ...clinic,
//         slots: doctorSlot.filter(
//           slot => slot.clinic_id == clinic.id
//         ),
//       };
//     });

//     const specialityId = Helper.parseIds(doctorInfo?.speciality);
//     const specialitys = await speclization.findAll({
//       where: {
//         id: {
//           [Op.in]: specialityId,
//         },
//       },
//       attributes: [
//         ["id", "value"],
//         ["name", "label"],
//       ],
//       order: [["id", "DESC"]],
//       raw: true,
//     });

//     return Helper.response(
//       true,
//       "Doctor Info",
//       {
//         ...doctorInfo,
//         specialitys,
//         qualifications,
//         experiences,
//         clinicWiseSlots,
//         onlineSlot
//       },
//       res,
//       200
//     );
//   } catch (error) {
//     console.error("Error fetching doctor info:", error);
//     return Helper.response(false, error?.message, error, res, 500);
//   }
// };

// exports.getDoctorProfile = async (req, res) => {
//   try {
//     let doctor_id = req.body?.doctor_id ?? req.users?.id;
//     if (!doctor_id && doctor_id != 0) {
//       const authHeader =
//         req.headers["authorization"] || req.headers["Authorization"];
//       const token = authHeader && authHeader.split(" ")[1];

//       if (!token) {
//         return Helper.response(false, "Token not provided", {}, res, 200);
//       }

//       const decoded = await Helper.verifyToken(token);
//       if (!decoded) {
//         return Helper.response("expired", "Invalid token", {}, res, 200);
//       }

//       const user = await Doctor.findOne({ where: { id: decoded.id } });

//       if (!user) {
//         return Helper.response(false, "User not found", {}, res, 200);
//       }

//       if (user.token !== token) {
//         return Helper.response(
//           "expired",
//           "Token Expired due to another login, Login Again!",
//           {},
//           res,
//           200
//         );
//       }

//       doctor_id = await Doctor.findOne({
//         where: {
//           id: user?.id,
//         },
//         attributes: ["id"],
//         raw: true,
//       }).then((data) => data?.id);
//     }

//     if (!doctor_id) {
//       return Helper.response(false, "Id is required", {}, res, 200);
//     }

//     const doctorInfo = await Doctor.findOne({
//       where: { id: doctor_id },
//       raw: true,
//     });

//     const qualifications = await Qualification.findAll({
//       where: {
//         doctorId: doctorInfo?.id,
//         status: true,
//       },
//       raw: true,
//     });

//     const clinicDetails = await clinic.findAll({
//       where: {
//         doctorId: doctorInfo?.id,
//       },
//       raw: true,
//       order: [["created_at", "desc"]],
//     });

//     const experiences = await Experience.findAll({
//       where: {
//         doctorId: doctorInfo?.id,
//         status: true,
//       },
//       raw: true,
//     });

//     const doctorSlot = await DoctorSlot.findAll({
//       where: {
//         doctor_id: doctorInfo?.id,
//       },
//       raw: true,
//     });
//     doctorInfo.doctorSlot = doctorSlot;

//     const specialityId = Helper.parseIds(doctorInfo?.speciality);
//     const specialitys = await speclization.findAll({
//       where: {
//         id: {
//           [Op.in]: specialityId,
//         },
//       },
//       attributes: [
//         ["id", "value"],
//         ["name", "label"],
//       ],
//       order: [["id", "DESC"]],
//       raw: true,
//     });

//     return Helper.response(
//       true,
//       "Doctor Info",
//       {
//         ...doctorInfo,
//         specialitys,
//         clinicDetails,
//         qualifications,
//         experiences,
//       },
//       res,
//       200
//     );
//   } catch (error) {
//     console.error("Error fetching doctor info:", error);
//     return Helper.response(false, error?.message, error, res, 500);
//   }
// };

exports.BookingList = async (req, res) => {
  try {
    const userId = req.users?.id;
    if (!userId) {
      return Helper.response(false, "Invalid User", {}, res, 400);
    }

    const { type } = req.body;
    if (!type) {
      return Helper.response(false, "Type is required", {}, res, 400);
    }
    console.log(userId, type);

    const whereCondition = {
      user_id: userId,
      type: type,
    };

    const bookings = await DoctorConsultationBooking.findAll({
      where: whereCondition,
      raw: true,
    });

    if (!bookings.length) {
      return Helper.response(false, "No Data Found", {}, res, 200);
    }

    /* ----------------------------------
       FETCH DOCTORS (ONE QUERY)
    ---------------------------------- */
    const doctorIds = [...new Set(bookings.map((b) => b.doctor_id))];

    const doctors = await Doctor.findAll({
      where: { id: doctorIds },
      attributes: ["id", "name", "profileImage"],
      raw: true,
    });

    const doctorMap = {};
    doctors.forEach((d) => {
      doctorMap[d.id] = d;
    });

    /* ----------------------------------
       FETCH CLINICS (ONE QUERY)
    ---------------------------------- */
    const clinicIds = [...new Set(bookings.map((b) => b.clinic_id))];

    const clinics = await clinic.findAll({
      where: { id: clinicIds },
      attributes: ["id", "clinic_name", "clinic_address"],
      raw: true,
    });

    const clinicMap = {};
    clinics.forEach((c) => {
      clinicMap[c.id] = c;
    });

    /* ----------------------------------
       DATE / TIME LOGIC
    ---------------------------------- */
    const nowMoment = moment();

    const upcoming = [];
    const completed = [];

    for (const b of bookings) {
      const doctor = doctorMap[b.doctor_id] || {};
      const clinicDetails = clinicMap[b.clinic_id] || {};

      const bookingDate = moment(b.slot_date, [
        "YYYY-MM-DD",
        "DD/MM/YYYY",
        "D-MMM",
      ]).format("YYYY-MM-DD");

      const bookingTime = moment(b.slot_time, [
        "hh:mm A",
        "HH:mm",
        "h:mm A",
      ]).format("hh:mm A");

      const bookingMoment = moment(
        `${bookingDate} ${bookingTime}`,
        "YYYY-MM-DD hh:mm A"
      );

      const entry = {
        ...b,
        doctor_name: doctor.name || null,
        doctor_profile: doctor.profileImage || null,
        formatted_date: bookingDate,
        formatted_time: bookingTime,
        prescription_img: b.prescription_img
          ? JSON.parse(b.prescription_img)
          : null,
        clinic_name: clinicDetails.clinic_name || null,
        clinic_address: clinicDetails.clinic_address || null,
      };

      if (bookingMoment.isAfter(nowMoment)) {
        upcoming.push(entry);
      } else {
        completed.push(entry);
      }
    }

    /* ----------------------------------
       SORTING
    ---------------------------------- */
    const sortByTime = (arr) =>
      arr.sort(
        (a, b) =>
          moment(
            `${a.formatted_date} ${a.formatted_time}`,
            "YYYY-MM-DD hh:mm A"
          ) -
          moment(
            `${b.formatted_date} ${b.formatted_time}`,
            "YYYY-MM-DD hh:mm A"
          )
      );

    const responseData = {
      upcoming: sortByTime(upcoming),
      completed: sortByTime(completed),
    };

    return Helper.response(
      true,
      "Data Found Successfully",
      responseData,
      res,
      200
    );
  } catch (error) {
    console.error("Error fetching booking list:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

// exports.BookingList = async (req, res) => {
//   try {
//     const id = req.users?.id;

//     const getBookingList = await DoctorConsultationBooking.findAll({
//       where: {
//         user_id: id,
//       },
//       raw: true,
//     });
//     if (getBookingList.length == 0) {
//       return Helper.response(false, "No Data Found", {}, res, 200);
//     }

//     const finalData = await Promise.all(
//       getBookingList.map(async (item) => {
//         const doctors = await Doctor.findOne({
//           where: {
//             id: item?.doctor_id,
//           },
//         });
//         return {
//           ...item,
//           name: doctors?.name,
//         };
//       })
//     );
//     return Helper.response(
//       true,
//       "Data Found Successfully",
//       finalData,
//       res,
//       200
//     );
//   } catch (error) {
//     console.error("Error fetching doctor info:", error);
//     return Helper.response(false, error?.message, {}, res, 500);
//   }
// };
