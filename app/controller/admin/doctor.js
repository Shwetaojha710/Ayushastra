const Product = require("../../model/product");
const sequelize = require("../../connection/connection");
const Helper = require("../../helper/helper");
const family_member = require("../../model/family_member");
const Doctor = require("../../model/doctor");
const DoctorChangeRequest = require("../../model/doctor_change_requests");
const DoctorConsultationBooking = require("../../model/booking");
const { Op } = require("sequelize");
const prescriptions = require("../../model/prescription");
const Clinic = require("../../model/clinic");
const DoctorSlot = require("../../model/doctor_slots");
const registered_user = require("../../model/registeredusers");
const prescription_medicines = require("../../model/prescription_medicines");
const Admin = require("../../model/admin");
// const clinic = require("../../model/clinic");

// exports.addDoctor=async(req,res)=>{
//   const t = await sequelize.transaction();
//    try {
//     const {
//       product_name,
//       mrp,
//       offer_price,
//       extra_product_description,
//       ayu_cash,
//       product_type,
//       brand,
//       category,
//       disease,
//       exp_date,
//       mfg_date,
//       fragile,
//       gst,
//       hsn,
//       sku,
//       stock,
//       publish,
//       unit,
//       status,
//       max_purchase_qty,
//       min_purchase_qty,
//       low_stock_alert,
//       long_description,
//       short_description,
//       ingredients,
//       meta_tags,
//     } = req.body;

//     if (!product_name || !sku || !mrp || !category) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Required fields are missing" });
//     }

//     const existing = await Product.findOne({ where: { sku } });
//     if (existing) {
//       return res
//         .status(400)
//         .json({ success: false, message: "SKU already exists" });
//     }

//     const slug = slugify(product_name, { lower: true, strict: true });
//     const metaImageFile =
//       req.files && req.files.meta_img ? req.files.meta_img[0] : null;
//     const bannerImageFile =
//       req.files && req.files.product_banner_img
//         ? req.files.product_banner_img[0]
//         : null;
//     const productImages =
//       req.files && req.files.product_images ? req.files.product_images : [];

//     const product = await Product.create(
//       {
//         product_name,
//         slug,
//         tags: meta_tags || "",
//         stock_alert: low_stock_alert || 0,
//         hold_stock: 0,
//         minimum_qty: min_purchase_qty || 1,
//         maximum_qty: max_purchase_qty || 1,
//         product_varitions: "",
//         mrp,
//         offer_price,
//         gst,
//         ayu_cash,
//         sku,
//         hsn,
//         disease_id: disease,
//         ingredient_id: ingredients,
//         publish: publish === "true" || publish === true,
//         category_id: category,
//         brand_id: brand,
//         tax_id: null,
//         product_type,
//         total_products: stock || 0,
//         manufacture_date: mfg_date,
//         expiry_date: exp_date,
//         short_description,
//         long_description,
//         status: status === "true" || status === true,
//         meta_image: metaImageFile ? metaImageFile.filename : null,
//         product_banner_image: bannerImageFile ? bannerImageFile.filename : null,
//         extra_product_details: extra_product_description,
//         isFragile: fragile === "true" || fragile === true,
//         unit,
//       },
//       { transaction: t }
//     );

//     if (productImages && productImages.length > 0) {
//       for (const img of productImages) {
//         await product_gallery.create(
//           {
//             productId: product.id,
//             image: img.filename,
//             doc_type: img.mimetype,
//             status: true,
//             createdBy: req.users?.id || null,
//             updatedBy: req.users?.id || null,
//           },
//           { transaction: t }
//         );
//       }
//     }

//     await t.commit();

//     return Helper.response(true, "Product created successfully", {}, res, 200);
//   } catch (error) {
//     await t.rollback();
//     console.error("Error adding product:", error);
//     return Helper.response(false, error?.message, {}, res, 200);
//   }
// }

exports.addProduct = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      product_name,
      mrp,
      offer_price,
      extra_product_description,
      ayu_cash,
      product_type,
      brand,
      category,
      disease,
      exp_date,
      mfg_date,
      fragile,
      gst,
      hsn,
      sku,
      stock,
      publish,
      unit,
      status,
      max_purchase_qty,
      min_purchase_qty,
      low_stock_alert,
      long_description,
      short_description,
      ingredients,
      meta_tags,
    } = req.body;

    if (!product_name || !sku || !mrp || !category) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields are missing" });
    }

    const existing = await Product.findOne({ where: { sku } });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "SKU already exists" });
    }

    const slug = slugify(product_name, { lower: true, strict: true });
    const metaImageFile =
      req.files && req.files.meta_img ? req.files.meta_img[0] : null;
    const bannerImageFile =
      req.files && req.files.product_banner_img
        ? req.files.product_banner_img[0]
        : null;
    const productImages =
      req.files && req.files.product_images ? req.files.product_images : [];

    const product = await Product.create(
      {
        product_name,
        slug,
        tags: meta_tags || "",
        stock_alert: low_stock_alert || 0,
        hold_stock: 0,
        minimum_qty: min_purchase_qty || 1,
        maximum_qty: max_purchase_qty || 1,
        product_varitions: "",
        mrp,
        offer_price,
        gst,
        ayu_cash,
        sku,
        hsn,
        disease_id: disease,
        ingredient_id: ingredients,
        publish: publish === "true" || publish === true,
        category_id: category,
        brand_id: brand,
        tax_id: null,
        product_type,
        total_products: stock || 0,
        manufacture_date: mfg_date,
        expiry_date: exp_date,
        short_description,
        long_description,
        status: status === "true" || status === true,
        meta_image: metaImageFile ? metaImageFile.filename : null,
        product_banner_image: bannerImageFile ? bannerImageFile.filename : null,
        extra_product_details: extra_product_description,
        isFragile: fragile === "true" || fragile === true,
        unit,
      },
      { transaction: t }
    );

    if (productImages && productImages.length > 0) {
      for (const img of productImages) {
        await product_gallery.create(
          {
            productId: product.id,
            image: img.filename,
            doc_type: img.mimetype,
            status: true,
            createdBy: req.users?.id || null,
            updatedBy: req.users?.id || null,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();

    return Helper.response(true, "Product created successfully", {}, res, 200);
  } catch (error) {
    await t.rollback();
    console.error("Error adding product:", error);
    return Helper.response(false, error?.message, {}, res, 200);
  }
};

exports.addFamilyMember = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { name, mobile, dob, age, gender } = req.body;

    if (!name || !mobile || !dob || !age || !gender) {
      await t.rollback();
      return Helper.response(
        false,
        "Required fields are missing",
        {},
        res,
        400
      );
    }

    const familMember = await family_member.create(
      {
        user_id: req.users?.id,
        name,
        mobile,
        dob,
        age,
        gender: gender?.value,
      },
      { transaction: t }
    );

    await t.commit();

    return Helper.response(
      true,
      "Family Member created successfully",
      {},
      res,
      200
    );
  } catch (error) {
    await t.rollback();
    console.error("Error adding Family Member:", error);
    return Helper.response(false, error?.message, {}, res, 200);
  }
};

exports.getFamilyMemberList = async (req, res) => {
  try {
    const id = req.users?.id;
    if (!id) {
      return Helper.response(false, "Id Is Required", {}, res, 200);
    }
    const members = await family_member.findAll({
      where: {
        user_id: id,
      },
      order: [["id", "DESC"]],
      attributes: ["id", "name", "dob", "age", "gender", "email", "mobile"],
    });
    if (!members) {
      return Helper.response(false, "No Family Members found", {}, res, 200);
    }
    return Helper.response(
      true,
      "Family Member list fetched successfully",
      members,
      res,
      200
    );
  } catch (error) {
    console.error("Error fetching Family Member list:", error);
    return Helper.response(false, error?.message, {}, res, 200);
  }
};

exports.updateFamilyMember = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id, name, mobile, dob } = req.body;

    if (!id) {
      await t.rollback();
      return Helper.response(false, "Id is Required", {}, res, 400);
    }
    const member = await family_member.findByPk(id);
    if (!member) {
      await t.rollback();
      return Helper.response(false, "Family Member not found", {}, res, 404);
    }
    member.name = name;
    member.mobile = mobile;
    member.dob = dob;
    await member.save({ transaction: t });
    await t.commit();

    return Helper.response(
      true,
      "Family Member updated successfully",
      {},
      res,
      200
    );
  } catch (error) {
    await t.rollback();
    console.error("Error updating Family Member:", error);
    return Helper.response(false, error?.message, {}, res, 200);
  }
};

exports.deleteFamilyMember = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.body;
    if (!id) {
      await t.rollback();
      return Helper.response(false, "Id is Required", {}, res, 400);
    }
    const member = await family_member.findByPk(id);
    if (!member) {
      await t.rollback();
      return Helper.response(false, "Family Member not found", {}, res, 404);
    }
    await member.destroy({ transaction: t });
    await t.commit();
    return Helper.response(
      true,
      "Family Member deleted successfully",
      {},
      res,
      200
    );
  } catch (error) {
    await t.rollback();
    console.error("Error deleting Family Member:", error);
    return Helper.response(false, error?.message, {}, res, 200);
  }
};

exports.ConsultDoctorList = async (req, res) => {
  try {
    const {
      specialization,
      qualification,
      diseases,
      city,
      symptom,
      consultation_type,
    } = req.body;

    let whereClause = {};

    if (specialization) {
      whereClause.specialization = specialization;
    }
    if (qualification) {
      whereClause.qualification = qualification;
    }
    if (diseases) {
      whereClause.diseases = diseases;
    }
    if (city) {
      whereClause.city = city;
    }
    if (symptom) {
      whereClause.symptom = symptom;
    }
    if (consultation_type) {
      whereClause.consultation_type = consultation_type;
    }

    const doctors = await Doctor.findAll({
      where: whereClause,
      order: [["id", "DESC"]],
      attributes: [
        "id",
        "name",
        "speciality",
        "degree",
        "experience",
        "disease",
        "cityId",
        "textConsult",
        "phoneConsult",
        "online_consultation_fees",
        "consultancyCharge",
        "availability",
      ],
    });

    if (!doctors || doctors.length == 0) {
      return Helper.response(false, "No Doctors found", {}, res, 200);
    }
    return Helper.response(
      true,
      "Doctor list fetched successfully",
      doctors,
      res,
      200
    );

    // Logic to fetch and return the list of doctors
    return Helper.response(
      true,
      "Doctor list fetched successfully",
      [],
      res,
      200
    );
  } catch (error) {
    console.error("Error fetching doctor list:", error);
    return Helper.response(false, error?.message, {}, res, 200);
  }
};

exports.UpdateDoctorDocument = async (req, res) => {
  try {
    const {
      reason,
      is_addhar_front,
      is_addhar_back,
      is_pan,
      is_certificate,
      id,
    } = req.body;
    if (!id) {
      return Helper.response(false, "Id is required", {}, res, 200);
    }
    if (
      reason &&
      is_addhar_front &&
      is_addhar_back &&
      is_pan &&
      is_certificate
    ) {
      await Doctor.update(
        {
          reason,
          is_addhar_front,
          is_addhar_back,
          is_pan,
          is_certificate,
        },
        {
          where: {
            id: id,
          },
        }
      );
    }
    if (reason) {
      await Doctor.update(
        {
          reason,
        },
        {
          where: {
            id: id,
          },
        }
      );
    }
    if (is_addhar_front) {
      await Doctor.update(
        {
          is_addhar_front,
        },
        {
          where: {
            id: id,
          },
        }
      );
    }
  } catch (error) {
    console.error("Error fetching doctor list:", error);
    return Helper.response(false, error?.message, {}, res, 200);
  }
};

exports.createDoctorChangeRequest = async (req, res) => {
  try {
    const { doctorId, remark, keys, actionType } = req.body;

    if (!doctorId) {
      return Helper.response(false, "doctorId is required", {}, res, 400);
    }

    if (!actionType) {
      return Helper.response(false, "actionType is required", {}, res, 400);
    }

    if (actionType == "approve") {
      await Doctor.update(
        { KYCstatus: actionType },
        { where: { id: doctorId } }
      );
      return Helper.response(
        true,
        "Change request submitted successfully",
        request,
        res,
        200
      );
    }

    // Save request in table
    const request = await DoctorChangeRequest.create({
      doctor_id: doctorId,
      remark,
      keys,
      action_type: actionType,
      status: "pending",
    });

    // Update doctor KYC status to change_requested
    await Doctor.update({ KYCstatus: actionType }, { where: { id: doctorId } });

    return Helper.response(
      true,
      "Change request submitted successfully",
      request,
      res,
      200
    );
  } catch (error) {
    console.error("ChangeRequest Error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.doctorDashboard = async (req, res) => {
  try {
    const doctor_id = req.users?.id;

    if (!doctor_id) {
      return Helper.response(false, "Doctor ID required", {}, res, 400);
    }

    const doctor=await Doctor.findOne({
      where:{
         id:doctor_id
      }
    })

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const [
      // ---------------- APPOINTMENTS ----------------
      totalAppointments,
      upcomingAppointments,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments,

      // ---------------- CONSULTATIONS ----------------
      totalConsultations,
      upcomingConsultations,
      pendingConsultations,
      completedConsultations,
      cancelledConsultations,

      // ---------------- TODAY ----------------
      todaysAppointments,
      todaysConsultations,

      // ---------------- PENDING PRESCRIPTIONS ----------------
      pendingPrescriptions,
    ] = await Promise.all([
      // ===== APPOINTMENTS =====
      DoctorConsultationBooking.count({
        where: { doctor_id, type: "book_appointment" },
      }),

      DoctorConsultationBooking.count({
        where: {
          doctor_id,
          type: "book_appointment",
          status: "pending",
          slot_date: { [Op.gte]: today },
        },
      }),

      DoctorConsultationBooking.count({
        where: {
          doctor_id,
          type: "book_appointment",
          status: "pending",
          slot_date: { [Op.lte]: today },
        },
      }),

      DoctorConsultationBooking.count({
        where: {
          doctor_id,
          type: "book_appointment",
          status: "completed",
        },
      }),

      DoctorConsultationBooking.count({
        where: {
          doctor_id,
          type: "book_appointment",
          status: "cancelled",
        },
      }),

      // ===== CONSULTATIONS =====
      DoctorConsultationBooking.count({
        where: { doctor_id, type: "book_consultation" },
      }),

      DoctorConsultationBooking.count({
        where: {
          doctor_id,
          type: "book_consultation",
          status: "pending",
          slot_date: { [Op.gte]: today },
        },
      }),

      DoctorConsultationBooking.count({
        where: {
          doctor_id,
          type: "book_consultation",
          status: "pending",
          slot_date: { [Op.lte]: today },
        },
      }),

      DoctorConsultationBooking.count({
        where: {
          doctor_id,
          type: "book_consultation",
          status: "completed",
        },
      }),

      DoctorConsultationBooking.count({
        where: {
          doctor_id,
          type: "book_consultation",
          status: "cancelled",
        },
      }),

      // ===== TODAY =====
      DoctorConsultationBooking.count({
        where: {
          doctor_id,
          type: "book_appointment",
          slot_date: today,
        },
      }),

      DoctorConsultationBooking.count({
        where: {
          doctor_id,
          type: "book_consultation",
          slot_date: today,
        },
      }),

      // ===== PENDING PRESCRIPTIONS =====
      DoctorConsultationBooking.count({
        where: {
          doctor_id,
          is_user_join: true,
          is_doctor_join: true,
          status: "pending",
          booking_id: {
            [Op.notIn]: sequelize.literal(
              `(SELECT booking_id FROM prescriptions)`
            ),
          },
        },
      }),
    ]);

    // const [
    //   // APPOINTMENTS
    //   totalAppointments,
    //   pendingAppointments,
    //   upcomingAppointments,
    //   completedAppointments,

    //   // CONSULTATIONS
    //   totalConsultations,
    //   upcomingConsultations,
    //   pendingConsultations,
    //   completedConsultations,

    //   // TODAY
    //   todaysAppointments,
    //   todaysConsultations,

    //   // PENDING PRESCRIPTIONS
    //   pendingPrescriptions,
    // ] = await Promise.all([
    //   // ---------------- APPOINTMENTS ----------------
    //   DoctorConsultationBooking.count({
    //     where: { doctor_id, type: "book_appointment" },
    //   }),

    //   DoctorConsultationBooking.count({
    //     where: {
    //       doctor_id,
    //       type: "book_appointment",
    //       status: "pending",
    //       slot_date: { [Op.lte]: today },
    //     },
    //   }),
    //   DoctorConsultationBooking.count({
    //     where: {
    //       doctor_id,
    //       type: "book_appointment",
    //       status: "pending",
    //       slot_date: { [Op.gte]: today },
    //     },
    //   }),

    //   DoctorConsultationBooking.count({
    //     where: {
    //       doctor_id,
    //       type: "book_appointment",
    //       status: "completed",
    //     },
    //   }),

    //   // ---------------- CONSULTATIONS ----------------
    //   DoctorConsultationBooking.count({
    //     where: { doctor_id, type: "book_consultation" ,
    //         },
    //   }),

    //   DoctorConsultationBooking.count({
    //     where: {
    //       doctor_id,
    //       type: "book_consultation",
    //       status: "pending",
    //       slot_date: { [Op.gte]: today },
    //     },
    //   }),
    //   DoctorConsultationBooking.count({
    //     where: {
    //       doctor_id,
    //       type: "book_consultation",
    //       status: "pending",
    //       slot_date: { [Op.lte]: today },
    //     },
    //   }),

    //   DoctorConsultationBooking.count({
    //     where: {
    //       doctor_id,
    //       type: "book_consultation",
    //       status: "completed",
    //     },
    //   }),

    //   // ---------------- TODAY ----------------
    //   DoctorConsultationBooking.count({
    //     where: {
    //       doctor_id,
    //       type: "book_appointment",
    //       slot_date: today,
    //     },
    //   }),

    //   DoctorConsultationBooking.count({
    //     where: {
    //       doctor_id,
    //       type: "book_consultation",
    //       slot_date: today,
    //     },
    //   }),

    //   // ---------------- PENDING PRESCRIPTIONS ----------------

    //   DoctorConsultationBooking.count({
    //     where: {
    //       doctor_id,
    //             is_user_join:true,
    //       is_doctor_join:true,
    //       status: "pending",
    //       booking_id: {
    //         [Op.notIn]: sequelize.literal(
    //           `(SELECT booking_id FROM prescriptions)`
    //         ),
    //       },
    //     },
    //   }),
    // ]);

    const dashboardStats = {
      today: {
        appointments: todaysAppointments,
        consultations: todaysConsultations,
      },
      overview: {
        appointments: {
          total: totalAppointments,
          upcoming: upcomingAppointments,
          completed: completedAppointments,
          pending: pendingAppointments,
        },
        consultations: {
          total: totalConsultations,
          upcoming: upcomingConsultations,
          completed: completedConsultations,
          pending: pendingConsultations,
        },
      },
      prescriptions: {
        pending: pendingPrescriptions,
      },
    };

    const clinicDetailsOffline = await Clinic.findAll({
      where: { doctorId: doctor_id, session_type: "offline" },
      raw: true,
      order: [["created_at", "desc"]],
    });
    const doctorSlot = await DoctorSlot.findAll({
      where: { doctor_id: doctor_id },
      raw: true,
    });
    const onlineSlot = await DoctorSlot.findAll({
      where: { doctor_id: doctor_id, session_type: "online" },
      raw: true,
    });

    const clinicWiseSlots = clinicDetailsOffline.map((clinic) => {
      return {
        ...clinic,
        slots: doctorSlot.filter((slot) => slot.clinic_id == clinic.id),
      };
    });

    const WebdashboardStats = [
      {
        id: 1,
        title: "Total Appointments",
        icon: "bi-people",
        color: "#a99213",
        value: totalAppointments,
        type: "book_appointment",
        scope: "total",
        stats: {
          // total: totalAppointments,
          upcoming: upcomingAppointments,
          completed: completedAppointments,
          // pending: pendingAppointments,
          cancelled: cancelledAppointments,
        },
      },

      {
        id: 2,
        title: "Total Consultations",
        icon: "bi-currency-rupee",
        color: "#618045",
        type: "book_consultation",
        scope: "total",
        value: totalConsultations,
        stats: {
          // total: totalConsultations,
          upcoming: upcomingConsultations,
          completed: completedConsultations,
          // pending: pendingConsultations,
          cancelled: cancelledConsultations,
        },
      },

      {
        id: 3,
        title: "Today Appointments",
        value: todaysAppointments,
        type: "book_appointment",
        scope: "today",
        icon: "bi-calendar-check",
        color: "#dc6424",
      },
      {
        id: 4,
        title: "Today Consultations",
        value: todaysConsultations,
        type: "book_consultation",
        scope: "today",
        icon: "bi-clipboard-heart",
        color: "#24a2dc",
      },
      {
        id: 5,
        title: "Pending Prescriptions",
        icon: "bi-currency-rupee",
        color: "#e03415ff",
        value: pendingPrescriptions,
        type: "prescriptions",
        scope: "total",
      },
    ];
    return Helper.response(
      true,
      "Doctor dashboard stats fetched",
      {
        dashboardStats,
        WebdashboardStats,
        clinicWiseSlots,
        onlineSlot,
        doctorSlot,
        online_consultation_fees: doctor?.online_consultation_fees ??0
      },
      res,
      200
    );
  } catch (error) {
    console.error("DoctorDashboard Error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.doctorDashboardList = async (req, res) => {
  try {
    const { scope, status, type } = req.body;
    const doctor_id = req.users?.id;

    if (!doctor_id) {
      return Helper.response(false, "Doctor id required", {}, res, 400);
    }

    if (
      !type ||
      !["book_appointment", "book_consultation", "prescriptions"].includes(type)
    ) {
      return Helper.response(
        false,
        "Type must be 'book_appointment', 'book_consultation', or 'prescriptions'",
        {},
        res,
        400
      );
    }

    if (!scope || !["today", "total"].includes(scope)) {
      return Helper.response(
        false,
        "Scope must be 'today' or 'total'",
        {},
        res,
        400
      );
    }

    const today = new Date().toISOString().split("T")[0];

    let where = { doctor_id };

    // Scope filter
    if (scope === "today") {
      where.slot_date = today;
    }

    // Status filter
    if (status && ["pending", "completed", "cancelled"].includes(status)) {
      where.status = status;
    }

    // Type filter (except prescriptions)
    if (type !== "prescriptions") {
      where.type = type;
    }

    // ---------------- PRESCRIPTIONS LIST ----------------
    if (type === "prescriptions") {
      const list = await DoctorConsultationBooking.findAll({
        where: {
          doctor_id,
          status: "pending",
          is_user_join: true,
          is_doctor_join: true,
          booking_id: {
            [Op.notIn]: sequelize.literal(
              `(SELECT booking_id FROM prescriptions)`
            ),
          },
        },
        order: [["slot_date", "DESC"]],
        raw: true,
      });

      return Helper.response(
        true,
        "Prescription pending list fetched successfully",
        list,
        res,
        200
      );
    }

    // ---------------- APPOINTMENT / CONSULTATION LIST ----------------
    let list = await DoctorConsultationBooking.findAll({
      where,
      order: [
        ["slot_date", "DESC"],
        ["slot_time", "ASC"],
      ],
      raw: true,
    });

    // Attach previous prescription safely
    list = await Promise.all(
      list.map(async (item) => {
        const prescription = await prescriptions.findOne({
          where: { booking_id: item.booking_id },
          raw: true,
        });
        const getUserMail = await registered_user.findOne({
          where: { id: item.user_id },
          attributes: ["email"],
          raw: true,
        });
        
        // return {
        //   ...item,
        //   previous_prescription: {
        //     disease: item.disease ? JSON.parse(item.disease) : [],
        //     prescription_img: prescription?.prescription_img ? JSON.parse(prescription?.prescription_img) :[],
        //     medicine_details: prescription?.medicine_details ? JSON.parse(prescription?.medicine_details) :[],
        //   },
        return {
          ...item,
          email:getUserMail?.email,
          previous_prescription: {
            disease: item?.disease
              ? Helper.safeJSONParse(item.disease, [])
              : [],

            prescription_img: item?.prescription_img
              ? Helper.safeJSONParse(item.prescription_img, [])
              : [],

            medicine_details: prescription?.medicine_details
              ? Helper.safeJSONParse(prescription.medicine_details, [])
              : [],
          },

          // },
        };
      })
    );

    // ---------------- SUMMARY (TOTAL ONLY) ----------------
    let summary = null;

    if (scope === "total") {
      summary = {
        total: await DoctorConsultationBooking.count({
          where: { doctor_id, type },
        }),
        pending: await DoctorConsultationBooking.count({
          where: { doctor_id, type, status: "pending" },
        }),
        completed: await DoctorConsultationBooking.count({
          where: { doctor_id, type, status: "completed" },
        }),
        cancelled: await DoctorConsultationBooking.count({
          where: { doctor_id, type, status: "cancelled" },
        }),
      };
    }

    return Helper.response(
      true,
      "Consultation list fetched successfully",
      { list, summary },
      res,
      200
    );
  } catch (error) {
    console.error("doctorDashboardList error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.consultantDashboardList = async (req, res) => {
  try {
    const uploadRoute = "upload";
    const doctor_id = req.users?.id;
    const { type = "upcoming" } = req.body; // upcoming | completed

    if (!doctor_id) {
      return Helper.response(false, "Doctor id required", {}, res, 400);
    }

    const today = new Date().toISOString().split("T")[0];

    let whereCondition = {
      doctor_id,
      type: "book_consultation",
    };

    if (type == "upcoming") {
      whereCondition.status = "pending";
      whereCondition.slot_date = { [Op.gte]: today };
    }

    if (type == "completed") {
      whereCondition.status = "completed";
    }

    const consultations = await DoctorConsultationBooking.findAll({
      where: whereCondition,
      order: [
        ["slot_date", "ASC"],
        ["slot_time", "ASC"],
      ],
      attributes: [
        "id",
        "booking_id",
        "slot_date",
        "slot_time",
        "name",
        "mobile",
        "gender",
        "age",
        "disease",
        "status",
        "user_id",
        "symptom",
        "prescription_img",
        "doctor_id",
      ],
      raw: true,
    });

    const finalData = await Promise.all(
      consultations.map(async (item) => {
        const prescription = await prescriptions.findOne({
          where: {
            booking_id: item?.booking_id,
          },
        });

        const doctorDetails = await Doctor.findOne({
          where: {
            id: item?.doctor_id,
          },
        });

        const userDetails = await registered_user.findOne({
          where: {
            id: item?.user_id,
          },
        });
        return {
          ...item,
          doctorName: doctorDetails?.name,
          doctorProfile: doctorDetails?.profileImage
            ? `${uploadRoute}/${doctorDetails?.profileImage}`
            : null,
          userName: `${userDetails?.first_name} ${userDetails?.last_name}`,
          userProfile: userDetails?.profile_image
            ? `${uploadRoute}/${userDetails?.profile_image}`
            : null,
          prescription,
          prescription_img: JSON.parse(item.prescription_img),
        };
      })
    );

    return Helper.response(
      true,
      "Consultation list fetched successfully",
      finalData,
      res,
      200
    );
  } catch (error) {
    console.error("ConsultantDashboard Error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

// exports.consultantDashboardList = async (req, res) => {
//   try {
//     const doctor_id = req.users?.id;
//     const { type = "upcoming" } = req.body; // upcoming | completed

//     if (!doctor_id) {
//       return Helper.response(false, "Doctor id required", {}, res, 400);
//     }

//     const today = new Date().toISOString().split("T")[0];

//     let whereCondition = {
//       doctor_id,
//       type: "book_consultation",
//     };

//     if (type == "upcoming") {
//       whereCondition.status = "pending";
//       whereCondition.slot_date = { [Op.gte]: today };
//     }

//     if (type == "completed") {
//       whereCondition.status = "completed";
//     }

//     const consultations = await DoctorConsultationBooking.findAll({
//       where: whereCondition,
//       order: [
//         ["slot_date", "ASC"],
//         ["slot_time", "ASC"],
//       ],
//       attributes: [
//         "id",
//         "booking_id",
//         "slot_date",
//         "slot_time",
//         "name",
//         "mobile",
//         "gender",
//         "age",
//         "disease",
//         "status",
//         "user_id",
//       ],
//       raw: true,
//     });

//     const finalData = await Promise.all(
//       consultations.map(async (item) => {
//         const prescription = await prescriptions.findOne({
//           where: {
//             booking_id: item?.booking_id,
//           },
//         });
//         return {
//           ...item,
//           prescription,
//         };
//       })
//     );

//     return Helper.response(
//       true,
//       "Consultation list fetched successfully",
//       finalData,
//       res,
//       200
//     );
//   } catch (error) {
//     console.error("ConsultantDashboard Error:", error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

// exports.AppointmentDashboardList = async (req, res) => {
//   try {
//     const doctor_id = req.users?.id;
//     const { type = "upcoming" } = req.body; // upcoming | completed

//     if (!doctor_id) {
//       return Helper.response(false, "Doctor id required", {}, res, 400);
//     }

//     const today = new Date().toISOString().split("T")[0];

//     let whereCondition = {
//       doctor_id,
//       type: "book_appointment",
//     };

//     // ---------------- FILTER ----------------
//     if (type == "upcoming") {
//       whereCondition.status = "pending";
//       whereCondition.slot_date = { [Op.gte]: today };
//     }

//     if (type == "completed") {
//       whereCondition.status = "completed";
//     }

//     const consultations = await DoctorConsultationBooking.findAll({
//       where: whereCondition,
//       order: [
//         ["slot_date", "ASC"],
//         ["slot_time", "ASC"],
//       ],
//       attributes: [
//         "id",
//         "booking_id",
//         "slot_date",
//         "slot_time",
//         "name",
//         "mobile",
//         "gender",
//         "age",
//         "disease",
//         "status",
//         "user_id",
//       ],
//       raw: true,
//     });

//     return Helper.response(
//       true,
//       "Consultation list fetched successfully",
//       consultations,
//       res,
//       200
//     );
//   } catch (error) {
//     console.error("ConsultantDashboard Error:", error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

exports.AppointmentDashboardList = async (req, res) => {
  try {
    const doctor_id = req.users?.id;
    const { type = "upcoming" } = req.body; // upcoming | completed

    if (!doctor_id) {
      return Helper.response(false, "Doctor id required", {}, res, 400);
    }

    const today = new Date().toISOString().split("T")[0];

    let whereCondition = {
      doctor_id,
      type: "book_appointment",
    };

    if (type == "upcoming") {
      whereCondition.status = "pending";
      whereCondition.slot_date = { [Op.gte]: today };
    }

    if (type == "completed") {
      whereCondition.status = "completed";
    }

    const consultations = await DoctorConsultationBooking.findAll({
      where: whereCondition,
      order: [
        ["slot_date", "ASC"],
        ["slot_time", "ASC"],
      ],
      attributes: [
        "id",
        "booking_id",
        "slot_date",
        "slot_time",
        "name",
        "mobile",
        "gender",
        "age",
        "disease",
        "status",
        "user_id",
        "symptom",
        "prescription_img",
      ],
      raw: true,
    });

    const bookingIds = consultations.map((c) => c.booking_id);

    const prescriptions = await prescription_medicines.findAll({
      where: {
        booking_id: {
          [Op.in]: bookingIds,
        },
      },
      attributes: ["booking_id"],
      group: ["booking_id"],
      raw: true,
    });

    const prescriptionSet = new Set(prescriptions.map((p) => p.booking_id));

    const finalResponse = consultations.map((item) => ({
      ...item,
      prescription_img: JSON.parse(item.prescription_img),
      is_prescription: prescriptionSet.has(item.booking_id),
      prescription_url: prescriptionSet.has(item.booking_id)
        ? "https://example.com/prescription/" + item.booking_id
        : null,
    }));

    return Helper.response(
      true,
      "Consultation list fetched successfully",
      finalResponse,
      res,
      200
    );
  } catch (error) {
    console.error("ConsultantDashboard Error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.createMultipleClinicsWithSlots = async (req, res) => {
  try {
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    let doctorId;
    let drtoken = await Doctor.findOne({
      where: {
        token,
      },
    });
    if (!drtoken) {
      drtoken = await Admin.findOne({
        where: {
          token,
        },
      });
      doctorId = req.body.doctor_id;
      if (!doctorId) {
        return Helper.response(false, "Doctor Id is Required", {}, res, 200);
      }
    } else {
      req.users = {
        id: drtoken.id,
        name: drtoken.name,
        token: drtoken.token,
        role: drtoken.role,
      };
      doctorId = req.users?.id;
    }
    if (!drtoken) {
      return Helper.response(false, "No User Found", {}, res, 200);
    }

    const { clinic: clinicData, slots } = req.body;

    if (!doctorId) {
      return Helper.response(false, "Doctor not authenticated", {}, res, 401);
    }

    if (!clinicData || !Array.isArray(slots)) {
      return Helper.response(false, "Invalid payload", {}, res, 400);
    }
    const existsClinic=await Clinic.findOne({
      where:{
        doctor_id:doctorId,
        clinic_name:clinicData?.clinic_name,
        clinic_address:clinicData?.clinic_address,
        fees:clinicData?.fees,
      }
    })
    // if(existsClinic){
    //   return Helper.response(false,"Clinic Already Exists",{},res,400)
    // }
    let createdClinic = null;
    let slotRows = [];

    await sequelize.transaction(async (t) => {
      if (clinicData.clinic_id > 0) {
        await DoctorSlot.destroy({
          where: {
            clinic_id: clinicData.clinic_id,
            doctorId,
          },
          transaction: t,
        });

        await Clinic.update(
          {
            session_type: "offline",
            clinic_name: clinicData.clinic_name,
            clinic_address: clinicData.clinic_address,
            fees: clinicData.fees,
            pin_code: clinicData.pin_code,
          },
          {
            where: {
              id: clinicData.clinic_id,
              doctorId: doctorId,
            },
            transaction: t,
          }
        );

        for (const dayObj of slots) {
          const { day, slots: daySlots } = dayObj;

          if (!day || !Array.isArray(daySlots) || daySlots.length === 0)
            continue;

          for (const timeSlot of daySlots) {
            slotRows.push({
              doctorId,
              clinic_id: clinicData.clinic_id,
              day,
              session_type: "offline",
              start_time: timeSlot.start_time,
              end_time: timeSlot.end_time,
              duration: clinicData.slot_duration,
              // clinic_image_2: clinic_image_2,
              // clinic_image_2: clinic_image_2,
              fees: clinicData.fees,
              pin_code: clinicData.pin_code,
            });
          }
        }
      } else {
        createdClinic = await Clinic.create(
          {
            doctorId,
            session_type: "offline",
            clinic_name: clinicData.clinic_name,
            clinic_address: clinicData.clinic_address,
            fees: clinicData.fees,
            pin_code: clinicData.pin_code,
          },
          { transaction: t }
        );

        for (const dayObj of slots) {
          const { day, slots: daySlots } = dayObj;

          if (!day || !Array.isArray(daySlots) || daySlots.length === 0)
            continue;

          for (const timeSlot of daySlots) {
            slotRows.push({
              doctorId,
              clinic_id: createdClinic.id,
              day,
              session_type: "offline",
              clinic_name: clinicData.clinic_name,
              clinic_address: clinicData.clinic_address,
              start_time: timeSlot.start_time,
              end_time: timeSlot.end_time,
              duration: clinicData.slot_duration,
              fees: clinicData.fees,
              pin_code: clinicData.pin_code,
            });
          }
        }
      }

      if (slotRows.length > 0) {
        await DoctorSlot.bulkCreate(slotRows, { transaction: t });
      }
    });

    return Helper.response(
      true,
      clinicData.clinic_id > 0
        ? "Clinic and slots updated successfully"
        : "Clinic and slots created successfully",
      {
        clinic: createdClinic,
        total_slots: slotRows.length,
      },
      res,
      clinicData.clinic_id > 0 ? 200 : 201
    );
  } catch (error) {
    console.error("Transaction error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

// exports.createMultipleClinicsWithSlots = async (req, res) => {
//   try {
//     const doctorId = req.users?.id;
//     const { clinic: clinicData, slots } = req.body;

//     if (!doctorId) {
//       return Helper.response(false, "Doctor not authenticated", {}, res, 401);
//     }

//     if (!clinicData || !Array.isArray(slots)) {
//       return Helper.response(false, "Invalid payload", {}, res, 400);
//     }

//     let createdClinic = null;
//     let slotRows = [];

//     await sequelize.transaction(async (t) => {
//       if (clinicData.clinic_id > 0) {
//         await DoctorSlot.destroy({
//           where: {
//             clinic_id: clinicData.clinic_id,
//             doctorId,
//           },
//           transaction: t,
//         });

//         await Clinic.update(
//           {
//             session_type: "offline",
//             clinic_name: clinicData.clinic_name,
//             clinic_address: clinicData.clinic_address,
//             fees: clinicData.fees,
//             pin_code: clinicData.pin_code,
//           },
//           {
//             where: {
//               id: clinicData.clinic_id,
//               doctorId: doctorId,
//             },
//             transaction: t,
//           }
//         );

//         for (const dayObj of slots) {
//           const { day, slots: daySlots } = dayObj;

//           if (!day || !Array.isArray(daySlots) || daySlots.length === 0)
//             continue;

//           for (const timeSlot of daySlots) {
//             slotRows.push({
//               doctorId,
//               clinic_id: clinicData.clinic_id,
//               day,
//               session_type: "offline",
//               start_time: timeSlot.start_time,
//               end_time: timeSlot.end_time,
//               duration: clinicData.slot_duration,
//               fees: clinicData.fees,
//               pin_code: clinicData.pin_code,
//             });
//           }
//         }
//       } else {
//         createdClinic = await Clinic.create(
//           {
//             doctorId,
//             session_type: "offline",
//             clinic_name: clinicData.clinic_name,
//             clinic_address: clinicData.clinic_address,
//             fees: clinicData.fees,
//             pin_code: clinicData.pin_code,
//           },
//           { transaction: t }
//         );

//         for (const dayObj of slots) {
//           const { day, slots: daySlots } = dayObj;

//           if (!day || !Array.isArray(daySlots) || daySlots.length === 0)
//             continue;

//           for (const timeSlot of daySlots) {
//             slotRows.push({
//               doctorId,
//               clinic_id: createdClinic.id,
//               day,
//               session_type: "offline",
//               clinic_name: clinicData.clinic_name,
//               clinic_address: clinicData.clinic_address,
//               start_time: timeSlot.start_time,
//               end_time: timeSlot.end_time,
//               duration: clinicData.slot_duration,
//               fees: clinicData.fees,
//               pin_code: clinicData.pin_code,
//             });
//           }
//         }
//       }

//       if (slotRows.length > 0) {
//         await DoctorSlot.bulkCreate(slotRows, { transaction: t });
//       }
//     });

//     return Helper.response(
//       true,
//       clinicData.clinic_id > 0
//         ? "Clinic and slots updated successfully"
//         : "Clinic and slots created successfully",
//       {
//         clinic: createdClinic,
//         total_slots: slotRows.length,
//       },
//       res,
//       clinicData.clinic_id > 0 ? 200 : 201
//     );
//   } catch (error) {
//     console.error("Transaction error:", error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

// exports.createMultipleClinicsWithSlots = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const doctorId = req.users?.id;
//     const { clinic: clinicData, slots } = req.body;

//     if (!doctorId) {
//       return Helper.response(false, "Doctor not authenticated", {}, res, 401);
//     }

//     if (!clinicData || !Array.isArray(slots) || slots.length == 0) {
//       return Helper.response(false, "Invalid payload", {}, res, 400);
//     }

//     const createdClinic = await Clinic.create(
//       {
//         doctorId,
//         session_type: "offline",
//         clinic_name: clinicData.clinic_name,
//         clinic_address: clinicData.clinic_address,
//         fees: clinicData.fees,
//         pin_code: clinicData.pin_code,
//       },
//       { transaction: t }
//     );

//     const slotRows = [];

//     for (const dayObj of slots) {
//       const { day, slots: daySlots } = dayObj;

//       if (!day || !Array.isArray(daySlots) || daySlots.length === 0) continue;

//       for (const timeSlot of daySlots) {
//         slotRows.push({
//           doctorId,
//           clinic_id: createdClinic.id,
//           day,
//           clinic_name: clinicData.clinic_name,
//           clinic_address: clinicData.clinic_address,
//           start_time: timeSlot.start_time,
//           end_time: timeSlot.end_time,
//           duration: clinicData?.slot_duration,
//           fees: clinicData.fees,
//           pin_code: clinicData.pin_code,
//         });
//       }
//     }

//     if (slotRows.length > 0) {
//       await DoctorSlot.bulkCreate(slotRows, { transaction: t });
//     }

//     await t.commit();

//     return Helper.response(
//       true,
//       "Clinic and slots created successfully",
//       {
//         clinic: createdClinic,
//         total_slots: slotRows.length,
//       },
//       res,
//       201
//     );
//   } catch (error) {
//     await t.rollback();
//     console.error(error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

// exports.doctorDashboard=async(req,res)=>{
//   try {

//     const doctor_id = req.users?.id;

//     if (!doctor_id) {
//       return Helper.response(false, "Doctor ID required", {}, res, 400);
//     }

//     const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

//     const [
//       totalAppointments,
//       upcomingAppointments,
//       completedAppointments,
//       totalConsultant,
//       upcomingConsultant,
//       completedConsultant,
//       PresceptionPending,
//     ] = await Promise.all([
//       // TOTAL
//       DoctorConsultationBooking.count({
//         where: { doctor_id ,type:'book_appointment'},
//       }),

//       // UPCOMING (Pending + future/today)
//       DoctorConsultationBooking.count({
//         where: {
//           doctor_id,
//           status: "pending",
//           type:'book_appointment',
//           slot_date: {
//             [Op.gte]: today,
//           },
//         },
//       }),

//       // COMPLETED
//       DoctorConsultationBooking.count({
//         where: {
//           doctor_id,
//           status: "completed",
//           type:'book_appointment',
//         },
//       }),

//        // TOTAL
//       DoctorConsultationBooking.count({
//         where: { doctor_id,type:'book_consultation', },
//       }),

//       // UPCOMING (Pending + future/today)
//       DoctorConsultationBooking.count({
//         where: {
//           doctor_id,
//           status: "pending",
//           type:'book_consultation',
//           slot_date: {
//             [Op.gte]: today,
//           },
//         },
//       }),

//       // COMPLETED
//       DoctorConsultationBooking.count({
//         where: {
//           doctor_id,
//           status: "completed",
//           type:'book_consultation',
//         },
//       }),

//        DoctorConsultationBooking.count({
//         where: { doctor_id ,status:'pending'},
//       }),

//     ]);

//     const dashboardStats = [
//       {
//         id: 1,
//         title: "Total Appointments",
//         value: totalAppointments,
//         icon: "bi-people",
//         color: "primary",
//       },
//       {
//         id: 2,
//         title: "Upcoming Appointments",
//         value: upcomingAppointments,
//         icon: "bi-calendar3-event",
//         color: "success",
//       },
//       {
//         id: 3,
//         title: "Completed Appointments",
//         value: completedAppointments,
//         icon: "bi-bag-check",
//         color: "info",
//       },

//       {
//         id: 4,
//         title: "Total Consultant",
//         value: totalConsultant,
//         icon: "bi-people",
//         color: "primary",
//       },
//       {
//         id: 5,
//         title: "Upcoming Consultant",
//         value: upcomingConsultant,
//         icon: "bi-calendar3-event",
//         color: "success",
//       },
//       {
//         id: 6,
//         title: "Completed Consultant",
//         value: completedConsultant,
//         icon: "bi-bag-check",
//         color: "info",
//       },
//       {
//         id: 6,
//         title: "Pending Presception",
//         value: PresceptionPending,
//         icon: "bi-bag-check",
//         color: "info",
//       },
//     ];

//     return Helper.response(
//       true,
//       "Doctor dashboard stats fetched",
//       dashboardStats,
//       res,
//       200
//     );

//   }  catch (error) {
//     console.error("ChangeRequest Error:", error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// }
