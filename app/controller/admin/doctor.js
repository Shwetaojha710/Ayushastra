const Product = require("../../model/product");
const sequelize = require("../../connection/connection");
const Helper = require("../../helper/helper");
const family_member = require("../../model/family_member");
const Doctor = require("../../model/doctor");

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
    const {
      name,
      mobile,
      dob,
      age,
      gender,
    } = req.body;

    if (!name || !mobile || !dob || !age || !gender) {
        await t.rollback();
      return Helper.response(false, "Required fields are missing", {}, res, 400);
    }

    const familMember = await family_member.create(
      {
        name,
        mobile,
        dob,  
        age,
        gender:gender?.value,
      },
      { transaction: t }
    );


    await t.commit();

    return Helper.response(true, "Family Member created successfully", {}, res, 200);
  } catch (error) {
    await t.rollback();
    console.error("Error adding Family Member:", error);
    return Helper.response(false, error?.message, {}, res, 200);
  }
};

exports.getFamilyMemberList = async (req, res) => { 
  try {
    const members = await family_member.findAll({
      order: [['id', 'DESC']],
      attributes: ['id', 'name', 'dob', 'age', 'gender', 'email', 'mobile'],  
    });
    if (!members) {
      return Helper.response(false, "No Family Members found", {}, res, 200);
    }
    return Helper.response(true, "Family Member list fetched successfully",  members , res, 200);
  } catch (error) {
    console.error("Error fetching Family Member list:", error);
    return Helper.response(false, error?.message, {}, res, 200);
  }
};

exports.updateFamilyMember = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      id,
      name,
      mobile,
      dob
    } = req.body;

    if (!id ) {
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

    return Helper.response(true, "Family Member updated successfully", {}, res, 200);
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
    return Helper.response(true, "Family Member deleted successfully", {}, res, 200);
  } catch (error) {
    await t.rollback();
    console.error("Error deleting Family Member:", error);
    return Helper.response(false, error?.message, {}, res, 200);
  }
};

exports.ConsultDoctorList = async (req, res) => { 
  try {
      
    const {specialization,qualification,diseases,city,symptom,consultation_type}=req.body;

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
        order: [['id', 'DESC']],
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
        "availability"
      ],
      });

      if (!doctors || doctors.length == 0) {
        return Helper.response(false, "No Doctors found", {}, res, 200);
      } 
      return Helper.response(true, "Doctor list fetched successfully",  doctors , res, 200);



    // Logic to fetch and return the list of doctors
    return Helper.response(true, "Doctor list fetched successfully",  [], res, 200);
  } catch (error) {
    console.error("Error fetching doctor list:", error);
    return Helper.response(false, error?.message, {}, res, 200);
  }
};