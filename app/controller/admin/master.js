const Diseases = require("../../model/diseases.js");
const Ingredient = require("../../model/ingredient.js");
const ProductType = require("../../model/product_type.js");
const Unit = require("../../model/unit.js");
const Brand = require("../../model/brand.js");
const Helper = require("../../helper/helper.js");
const Salt = require("../../model/salt.js");
const Product = require("../../model/product.js");
const product_gallery = require("../../model/product_gallery.js");
const { Op, col, fn } = require("sequelize");
const sequelize = require("../../connection/connection.js");
const ingredient = require("../../model/ingredient.js");
const Category = require("../../model/category.js");
const slugify = require("slugify");
const banner = require("../../model/banner.js");
const coupons = require("../../model/coupon.js");
const State = require("../../model/state.js");
const District = require("../../model/district.js");
const Doctor = require("../../model/doctor.js");
const Qualification = require("../../model/qualification.js");
const path = require("path");
const speclization = require("../../model/specilization.js");
const { diff } = require("util");
const registered_user = require("../../model/registeredusers.js");
const fs = require("fs");
const moment = require("moment");
const DoctorSlot = require("../../model/doctor_slots.js");
const CityMaster = require("../../model/city_master.js");
const clinic = require("../../model/clinic.js");
const DoctorChangeRequest = require("../../model/doctor_change_requests.js");
const department = require("../../model/department.js");
const Experience = require("../../model/experience.js");
const treatment_master = require("../../model/treatment_master.js");
const TodayPatient = require("../../model/today_patients.js");
// product_gallery

exports.addDiseases = async (req, res) => {
  const { name, description, status } = req.body;
  try {
    if (!name) {
      return Helper.response(false, "Diseases name is required", [], res, 400);
    }

    const existingDiseases = await Diseases.findOne({
      where: { name: name.trim() },
    });
    if (existingDiseases) {
      Helper.deleteUploadedFiles(req.files);
      return Helper.response(false, "Diseases already exists.", [], res, 400);
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return Helper.response(false, "No files uploaded", null, res, 400);
    }

    const createdDocs = [];

    for (const file of req.files) {
      const newDoc = await Diseases.create({
        name: name.trim(),
        description: description,
        status,
        doc_type: file.mimetype,
        image: file.filename,
        createdBy: req.users?.id,
        updatedBy: req.users?.id,
      });
      createdDocs.push(newDoc);
    }

    return Helper.response(
      true,
      "Diseases added successfully",
      createdDocs,
      res,
      200
    );
  } catch (error) {
    console.error("Error adding Diseases:", error);
    Helper.deleteUploadedFiles(req.files);
    return Helper.response(false, error?.message, null, res, 500);
  }
};

exports.getAllDiseases = async (req, res) => {
  try {
    const categories = await Diseases.findAll({
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (categories.length === 0) {
      return Helper.response(false, "No Diseases found", [], res, 404);
    }
    return Helper.response(
      true,
      "Diseases fetched successfully",
      categories,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching Diseases",
      res,
      500
    );
  }
};

exports.getDiseasesDD = async (req, res) => {
  try {
    const categories = await Diseases.findAll({
      attributes: [
        [col("id"), "value"],
        [col("name"), "label"],
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (categories.length == 0) {
      return Helper.response(false, "No Diseases found", [], res, 200);
    }
    return Helper.response(
      true,
      "Diseases fetched successfully",
      categories,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching Diseases",
      res,
      500
    );
  }
};

exports.updateDiseases = async (req, res) => {
  try {
    const { id, name, description, status } = req.body;

    if (!id) {
      return Helper.response(false, "Diseases ID is required", [], res, 400);
    }
    // if (!name) {
    //   return Helper.response(false, "Diseases name is required", [], res, 400);
    // }

    const disease = await Diseases.findByPk(id);
    if (!disease) {
      return Helper.response(false, "Diseases not found", [], res, 404);
    }

    if (req.files && req.files.length > 0) {
      if (disease.image) {
        const oldPath = path.join(__dirname, "../uploads", disease.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const file = req.files[0];
      disease.doc_type = file.mimetype;
      disease.image = file.filename;
    }

    disease.name = name || disease.name;
    disease.status = status || disease.status;
    disease.description = description || disease.description;
    disease.updatedBy = req.users?.id;

    await disease.save();

    return Helper.response(
      true,
      "Diseases updated successfully",
      disease,
      res,
      200
    );
  } catch (error) {
    console.error("Error updating Diseases:", error);
    return Helper.response(false, error.message, null, res, 500);
  }
};

exports.deleteDiseases = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return Helper.response(false, "Diseases ID is required", [], res, 400);
    }

    const disease = await Diseases.findByPk(id);
    if (!disease) {
      return Helper.response(false, "Diseases not found", [], res, 404);
    }

    // delete file if exists
    if (disease.image) {
      const oldPath = path.join(__dirname, "../uploads", disease.image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    await disease.destroy();

    return Helper.response(true, "Diseases deleted successfully", [], res, 200);
  } catch (error) {
    console.error("Error deleting Diseases:", error);
    return Helper.response(false, error.message, null, res, 500);
  }
};

exports.addUnit = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      return Helper.response(false, "Unit is required", [], res, 400);
    }

    const unit = await Unit.create({ name, status, createdBy: req.users.id });
    return Helper.response(true, "Unit added successfully", unit, res, 201);
  } catch (error) {
    return Helper.response(false, error.message, "Error adding Unit", res, 500);
  }
};

exports.getAllUnit = async (req, res) => {
  try {
    const Units = await Unit.findAll({
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No Unit found", [], res, 404);
    }
    return Helper.response(true, "Unit fetched successfully", Units, res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching Unit",
      res,
      500
    );
  }
};

exports.getAllUnitDD = async (req, res) => {
  try {
    const Units = await Unit.findAll({
      attributes: [
        [col("id"), "value"],
        [col("name"), "label"],
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No Unit found", [], res, 404);
    }
    return Helper.response(true, "Unit fetched successfully", Units, res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching Unit",
      res,
      500
    );
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const { id, name, status } = req.body;
    if (!id) {
      return Helper.response(false, "ID is required", [], res, 400);
    }
    // if (!name) {
    //   return Helper.response(false, "Unit name is required", [], res, 400);
    // }

    const Units = await Unit.findByPk(id);
    if (!Units) {
      return Helper.response(false, "Unit not found", [], res, 404);
    }

    Units.name = name || Units.name;
    Units.status = status;
    Units.updatedBy = req.users.id;
    await Units.save();
    return Helper.response(true, "Units updated successfully", Units, res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error updating Unit",
      res,
      500
    );
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return Helper.response(false, "Unit ID is required", [], res, 400);
    }
    const category = await Unit.findByPk(id);
    if (!category) {
      return Helper.response(false, "Unit not found", [], res, 404);
    }

    await Unit.destroy();
    return Helper.response(true, "Unit deleted successfully", [], res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error deleting Unit",
      res,
      500
    );
  }
};

exports.addBrand = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      return Helper.response(false, "Brand is required", [], res, 400);
    }

    const unit = await Brand.create({ name, status, createdBy: req.users.id });
    return Helper.response(true, "Brand added successfully", unit, res, 201);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error adding Brand",
      res,
      500
    );
  }
};

exports.getAllBrand = async (req, res) => {
  try {
    const Units = await Brand.findAll({
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No Unit found", [], res, 404);
    }
    return Helper.response(true, "Unit fetched successfully", Units, res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching Unit",
      res,
      500
    );
  }
};
exports.getAllBrandDD = async (req, res) => {
  try {
    const Units = await Brand.findAll({
      attributes: [
        [col("id"), "value"],
        [col("name"), "label"],
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No Unit found", [], res, 404);
    }
    return Helper.response(true, "Unit fetched successfully", Units, res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching Unit",
      res,
      500
    );
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { id, name, status } = req.body;
    if (!id) {
      return Helper.response(false, "ID is required", [], res, 400);
    }
    // if (!name) {
    //   return Helper.response(false, "Unit name is required", [], res, 400);
    // }

    const Units = await Brand.findByPk(id);
    if (!Units) {
      return Helper.response(false, "Unit not found", [], res, 404);
    }

    Units.name = name || Units.name;
    Units.status = status;
    Units.updatedBy = req.users.id;
    await Units.save();
    return Helper.response(true, "Units updated successfully", Units, res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error updating Unit",
      res,
      500
    );
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return Helper.response(false, "Unit ID is required", [], res, 400);
    }
    const category = await Brand.findByPk(id);
    if (!category) {
      return Helper.response(false, "Unit not found", [], res, 404);
    }

    await Brand.destroy();
    return Helper.response(true, "Unit deleted successfully", [], res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error deleting Unit",
      res,
      500
    );
  }
};

exports.addingredient = async (req, res) => {
  try {
    const { name, status, description } = req.body;

    if (!name) {
      return Helper.response(false, "Ingredient is required", [], res, 400);
    }
    const createdDocs = [];
    // const unit = await Ingredient.create({
    //   name,
    //   status,
    //   createdBy: req.users.id,
    // });
    const checkIngredient = await Ingredient.findOne({
      where: {
        name,
      },
    });
    if (checkIngredient) {
      return Helper.response(
        true,
        "Ingredient Name Already Exists",
        checkIngredient,
        res,
        200
      );
    }

    for (const file of req.files) {
      let newDoc = await Ingredient.create({
        name,
        status,
        description,
        createdBy: req.users.id,
        doc_type: file.mimetype,
        image: file.filename,
      });
      createdDocs.push(newDoc);
    }

    return Helper.response(
      true,
      "Ingredient added successfully",
      newDoc,
      res,
      200
    );
  } catch (error) {
    return Helper.response(false, error.message, "Error adding Unit", res, 500);
  }
};

exports.getAllIngredient = async (req, res) => {
  try {
    const Units = await Ingredient.findAll({
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No Ingredient found", [], res, 404);
    }
    return Helper.response(
      true,
      "Ingredient fetched successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching Ingredient",
      res,
      500
    );
  }
};
exports.getAllIngredientDD = async (req, res) => {
  try {
    const Units = await Ingredient.findAll({
      attributes: [
        [col("id"), "value"],
        [col("name"), "label"],
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No Ingredient found", [], res, 404);
    }
    return Helper.response(
      true,
      "Ingredient fetched successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching Ingredient",
      res,
      500
    );
  }
};

// exports.updateIngredient = async (req, res) => {
//   try {
//      const { name, status, description } = req.body;
//     if (!id) {
//       return Helper.response(false, "ID is required", [], res, 400);
//     }
//     // if (!name) {
//     //   return Helper.response(
//     //     false,
//     //     "Ingredient name is required",
//     //     [],
//     //     res,
//     //     400
//     //   );
//     // }

//     const Units = await Ingredient.findByPk(id);
//     if (!Units) {
//       return Helper.response(false, "Ingredient not found", [], res, 404);
//     }

//     Units.name = name || Units.name;
//     Units.status = status;
//     Units.updatedBy = req.users.id;
//     await Units.save();
//     return Helper.response(true, "Units updated successfully", Units, res, 200);
//   } catch (error) {
//     return Helper.response(
//       false,
//       error.message,
//       "Error updating Unit",
//       res,
//       500
//     );
//   }
// };

exports.updateIngredient = async (req, res) => {
  try {
    const { id, name, status, description } = req.body;

    if (!id) {
      return Helper.response(false, "Category ID is required", [], res, 400);
    }
    // if (!name) {
    //   return Helper.response(false, "Category name is required", [], res, 400);
    // }

    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient) {
      return Helper.response(false, "Ingredient not found", [], res, 404);
    }

    if (req.files && req.files.length > 0) {
      if (ingredient.image) {
        Helper.deleteFile(ingredient.image);
      }

      const file = req.files[0];
      ingredient.image = file.filename;
      ingredient.doc_type = file.mimetype;
    }

    ingredient.name = name || ingredient.name;
    ingredient.status = status;
    ingredient.description = description || ingredient?.description;
    ingredient.updatedBy = req.users.id;

    await ingredient.save();

    return Helper.response(
      true,
      "Ingredient updated successfully",
      ingredient,
      res,
      200
    );
  } catch (error) {
    console.error("Error updating ingredient:", error);
    Helper.deleteUploadedFiles(req.files);
    return Helper.response(false, error.message, null, res, 500);
  }
};

exports.deleteIngredient = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return Helper.response(false, "Ingredient ID is required", [], res, 400);
    }
    const category = await Ingredient.findByPk(id);
    if (!category) {
      return Helper.response(false, "Ingredient not found", [], res, 404);
    }

    await Ingredient.destroy();
    return Helper.response(
      true,
      "Ingredient deleted successfully",
      [],
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error deleting Ingredient",
      res,
      500
    );
  }
};

exports.addProductType = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      return Helper.response(false, "Ingredient is required", [], res, 400);
    }
    const existingProductType = await ProductType.findOne({ where: { name } });
    if (existingProductType) {
      return Helper.response(
        false,
        "ProductType name already exists",
        [],
        res,
        409
      );
    }

    const unit = await ProductType.create({
      name,
      status,
      createdBy: req.users.id,
    });
    return Helper.response(
      true,
      "Ingredient added successfully",
      unit,
      res,
      201
    );
  } catch (error) {
    return Helper.response(false, error.message, "Error adding Unit", res, 500);
  }
};

exports.getAllProductType = async (req, res) => {
  try {
    const Units = await ProductType.findAll({
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No ProductType found", [], res, 404);
    }
    return Helper.response(
      true,
      "ProductType fetched successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching ProductType",
      res,
      500
    );
  }
};
exports.getAllProductTypeDD = async (req, res) => {
  try {
    const Units = await ProductType.findAll({
      attributes: [
        [col("id"), "value"],
        [col("name"), "label"],
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No ProductType found", [], res, 404);
    }
    return Helper.response(
      true,
      "ProductType fetched successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching ProductType",
      res,
      500
    );
  }
};

exports.updateProductType = async (req, res) => {
  try {
    const { id, name, status } = req.body;
    if (!id) {
      return Helper.response(false, "ID is required", [], res, 400);
    }
    // if (!name) {
    //   return Helper.response(
    //     false,
    //     "ProductType name is required",
    //     [],
    //     res,
    //     400
    //   );
    // }

    const Units = await ProductType.findByPk(id);
    if (!Units) {
      return Helper.response(false, "ProductType not found", [], res, 404);
    }

    Units.name = name || Units.name;
    Units.status = status;
    Units.updatedBy = req.users.id;
    await Units.save();
    return Helper.response(true, "Units updated successfully", Units, res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error updating Unit",
      res,
      500
    );
  }
};

exports.deleteProductType = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return Helper.response(false, "ProductType ID is required", [], res, 400);
    }
    const category = await ProductType.findByPk(id);
    if (!category) {
      return Helper.response(false, "ProductType not found", [], res, 404);
    }

    await ProductType.destroy();
    return Helper.response(
      true,
      "ProductType deleted successfully",
      [],
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error deleting ProductType",
      res,
      500
    );
  }
};

exports.addsalt = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      return Helper.response(false, "Salt is required", [], res, 400);
    }
    const existingProductType = await Salt.findOne({ where: { name } });
    if (existingProductType) {
      return Helper.response(false, "Salt name already exists", [], res, 409);
    }

    const unit = await Salt.create({
      name,
      status,
      createdBy: req.users.id,
    });
    return Helper.response(true, "Salt added successfully", unit, res, 201);
  } catch (error) {
    return Helper.response(false, error.message, "Error adding Salt", res, 500);
  }
};

exports.getAllsalt = async (req, res) => {
  try {
    const Units = await Salt.findAll({
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No Salt found", [], res, 404);
    }
    return Helper.response(true, "Salt fetched successfully", Units, res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching Salt",
      res,
      500
    );
  }
};
exports.getAllsaltDD = async (req, res) => {
  try {
    const Units = await Salt.findAll({
      attributes: [
        [col("id"), "value"],
        [col("name"), "label"],
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No Salt found", [], res, 404);
    }
    return Helper.response(true, "Salt fetched successfully", Units, res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching Salt",
      res,
      500
    );
  }
};

exports.updateSalt = async (req, res) => {
  try {
    const { id, name, status } = req.body;
    if (!id) {
      return Helper.response(false, "ID is required", [], res, 400);
    }
    // if (!name) {
    //   return Helper.response(false, "Salt name is required", [], res, 400);
    // }

    const Units = await Salt.findByPk(id);
    if (!Units) {
      return Helper.response(false, "Salt not found", [], res, 404);
    }

    Units.name = name || Units.name;
    Units.status = status;
    Units.updatedBy = req.users.id;
    await Units.save();
    return Helper.response(true, "Salt updated successfully", Units, res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error updating Unit",
      res,
      500
    );
  }
};

exports.deleteSalt = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return Helper.response(false, "Salt ID is required", [], res, 400);
    }
    const category = await Salt.findByPk(id);
    if (!category) {
      return Helper.response(false, "Salt not found", [], res, 404);
    }

    await Salt.destroy();
    return Helper.response(true, "Salt deleted successfully", [], res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error deleting Salt",
      res,
      500
    );
  }
};

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
      final_price,
      discount_type,
      product_meta_title,
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
        final_price,
        discount_type,
        product_meta_title,
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

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [["id", "ASC"]],
      raw: true,
    });

    if (products.length === 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }

    const finalData = await Promise.all(
      products.map(async (item) => {
        const ProductGallery = await product_gallery.findAll({
          where: { productId: item.id },
          raw: true,
          order: [["id", "ASC"]],
        });
        const ingredientIds = item.ingredient_id
          ? item.ingredient_id
              .split(",")
              .map((i) => parseInt(i.trim()))
              .filter((i) => !isNaN(i))
          : [];
        const disease_id = item.disease_id
          ? item.disease_id
              .split(",")
              .map((i) => parseInt(i.trim()))
              .filter((i) => !isNaN(i))
          : [];
        return {
          ...item,
          product_gallery: ProductGallery,
          disease: await Diseases.findAll({
            where: {
              id: {
                [Op.in]: disease_id,
              },
            },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),
          ingredient: await Ingredient.findAll({
            where: {
              id: {
                [Op.in]: ingredientIds,
              },
            },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),
          category: await Category.findOne({
            where: { id: item?.category_id },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),
          brand: await Brand.findOne({
            where: { id: item?.brand_id },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),
          product_types: await ProductType.findOne({
            where: { id: item?.product_type },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),
          unit_data: item?.unit
            ? await Unit.findOne({
                where: { id: item?.unit },
                raw: true,
                attributes: [
                  [col("id"), "value"],
                  [col("name"), "label"],
                ],
              })
            : null,
        };
      })
    );

    return Helper.response(
      true,
      "Data Found Successfully",
      finalData,
      res,
      200
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return Helper.response(
      false,
      error?.message || "Something went wrong",
      [],
      res,
      500
    );
  }
};

exports.ProductById = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return Helper.response(false, "Id Is Required", {}, res, 200);
    }
    const products = await Product.findAll({
      where: {
        id: id,
      },
      order: [["id", "ASC"]],
      raw: true,
    });

    if (products.length === 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }

    const finalData = await Promise.all(
      products.map(async (item) => {
        const ProductGallery = await product_gallery.findAll({
          where: { productId: item.id },
          raw: true,
          order: [["id", "ASC"]],
        });
        const ingredientIds = item.ingredient_id
          ? item.ingredient_id
              .split(",")
              .map((i) => parseInt(i.trim()))
              .filter((i) => !isNaN(i))
          : [];
        const disease_id = item.disease_id
          ? item.disease_id
              .split(",")
              .map((i) => parseInt(i.trim()))
              .filter((i) => !isNaN(i))
          : [];
        return {
          ...item,
          product_gallery: ProductGallery,
          disease: await Diseases.findAll({
            where: {
              id: {
                [Op.in]: disease_id,
              },
            },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),
          ingredient: await Ingredient.findAll({
            where: {
              id: {
                [Op.in]: ingredientIds,
              },
            },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),
          category: await Category.findOne({
            where: { id: item?.category_id },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),
          brand: await Brand.findOne({
            where: { id: item?.brand_id },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),
          product_types: await ProductType.findOne({
            where: { id: item?.product_type },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),
          unit_data: item?.unit
            ? await Unit.findOne({
                where: { id: item?.unit },
                raw: true,
                attributes: [
                  [col("id"), "value"],
                  [col("name"), "label"],
                ],
              })
            : null,
        };
      })
    );

    return Helper.response(
      true,
      "Data Found Successfully",
      finalData[0],
      res,
      200
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return Helper.response(
      false,
      error?.message || "Something went wrong",
      [],
      res,
      500
    );
  }
};

exports.getAllProductsDD = async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: [
        [col("id"), "value"],
        [col("product_name"), "label"],
      ],
      order: [["id", "ASC"]],
      raw: true,
    });

    if (products.length === 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }

    return Helper.response(true, "Data Found Successfully", products, res, 200);
  } catch (error) {
    console.error("Error fetching products:", error);
    return Helper.response(
      false,
      error?.message || "Something went wrong",
      [],
      res,
      500
    );
  }
};

// Update Product API
exports.updateProduct = async (req, res) => {
  const t = await sequelize.transaction(); // start transaction
  try {
    const { id } = req.body;
    if (!id) {
      return Helper.response(false, "Product ID is required", {}, res, 400);
    }

    // const product = await Product.findOne(id, { transaction: t });
    const product = await Product.findOne({
      where: {
        id,
      },
    });
    if (!product) {
      return Helper.response(false, "Product not found", {}, res, 404);
    }

    // Convert ingredients/disease to CSV strings if arrays
    if (req.body.ingredients && Array.isArray(req.body.ingredients)) {
      req.body.ingredient_id = req.body.ingredients.join(",");
    }
    if (req.body.disease && Array.isArray(req.body.disease)) {
      req.body.disease_id = req.body.disease.join(",");
    }
    let slug;
    if (req.body.product_name) {
      slug = slugify(req.body.product_name, { lower: true, strict: true });
    }
    // Update product fields
    const updateFields = {
      product_name: req.body.product_name,
      mrp: req.body.mrp,
      offer_price: req.body.offer_price,
      extra_product_details: req.body.extra_product_description,
      ayu_cash: req.body.ayu_cash,
      product_type: req.body.product_type,
      brand_id: req.body.brand,
      category_id: req.body.category,
      disease_id: req.body.disease_id || req.body.disease,
      ingredient_id: req.body.ingredient_id || req.body.ingredients,
      exp_date: req.body.exp_date,
      manufacture_date: req.body.mfg_date,
      isFragile: req.body.fragile
        ? req.body.fragile === "true"
        : product?.fragile,
      gst: req.body.gst,
      hsn: req.body.hsn,
      sku: req.body.sku,
      stock: req.body.stock,
      isPublish: req.body.publish
        ? req.body.publish === "true"
        : product?.publish,
      unit: req.body.unit,
      status: req.body.status ? req.body.status === "true" : product?.status,
      max_purchase_qty: req.body.max_purchase_qty,
      minimum_qty: req.body.min_purchase_qty,
      stock_alert: req.body.low_stock_alert,
      long_description: req.body.long_description,
      short_description: req.body.short_description,
      tags: req.body.meta_tags,
      slug,
      discount_type: req.body.discount_type,
      final_price: req.body.final_price,
      product_meta_title: req.body.product_meta_title
        ? req.body.product_meta_title
        : product?.product_meta_title,
    };

    // Update meta image if uploaded
    if (req.files?.meta_img?.length > 0) {
      updateFields.meta_image = req.files.meta_img[0].filename;
    }

    // Update product banner image if uploaded
    if (req.files?.product_banner_img?.length > 0) {
      updateFields.product_banner_image =
        req.files.product_banner_img[0].filename;
    }

    await product.update(updateFields, { transaction: t });

    // Handle multiple product images
    if (req.files?.product_images?.length > 0) {
      await product_gallery.destroy(
        {
          where: {
            productId: id,
          },
        },
        { transaction: t }
      );
      for (const file of req.files.product_images) {
        await product_gallery.create(
          {
            productId: product.id,
            image: file.filename,
            doc_type: file.mimetype,
            status: true,
            createdBy: req.users?.id || null,
            updatedBy: req.users?.id || null,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();

    return Helper.response(
      true,
      "Product updated successfully",
      product,
      res,
      200
    );
  } catch (error) {
    await t.rollback();
    console.error("Error updating product:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await product.destroy();
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.addBanner = async (req, res) => {
  try {
    const { banner_alt, order, meta_keywords, status = true } = req.body;
    if (!banner_alt || !order || !meta_keywords) {
      return Helper.response(false, "All fields are Required!", {}, res, 404);
    }

    const existingCategory = await banner.findOne({
      where: { image_alt: banner_alt, order, meta_tags: meta_keywords },
    });
    if (existingCategory) {
      Helper.deleteUploadedFiles(req.files);
      return Helper.response(false, "Banner already exists.", [], res, 400);
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return Helper.response(false, "No files uploaded", null, res, 400);
    }

    const createdDocs = [];

    for (const file of req.files) {
      const newDoc = await banner.create({
        image_alt: banner_alt,
        order: order || 0,
        doc_type: file.mimetype,
        banner_image: file.filename,
        meta_tags: meta_keywords,
        createdBy: req.users?.id,
        updatedBy: req.users?.id,
        status: status || true,
      });
      createdDocs.push(newDoc);
    }

    return Helper.response(true, "Banner Created Successfully", {}, res, 200);
  } catch (error) {
    console.error("Error adding banner:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.getBanner = async (req, res) => {
  try {
    const bannerData = await banner.findAll({
      order: [["id", "desc"]],
      raw: true,
    });
    if (bannerData.length == 0) {
      return Helper.response(false, "No Data Found", {}, res, 200);
    }
    if (bannerData.length > 0) {
      return Helper.response(
        true,
        "Data Found Successfully",
        bannerData,
        res,
        200
      );
    }
  } catch (error) {
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { id, banner_alt, order, meta_keywords, status = true } = req.body;

    if (!id) {
      return Helper.response(false, "Banner ID is required!", {}, res, 400);
    }

    const existingBanner = await banner.findOne({ where: { id } });
    if (!existingBanner) {
      return Helper.response(false, "Banner not found!", {}, res, 404);
    }

    // if (!banner_alt || !order || !meta_keywords) {
    //   return Helper.response(false, "All fields are required!", {}, res, 400);
    // }

    let updatedFileName = existingBanner.banner_image;
    if (req.files && req.files.length > 0) {
      if (existingBanner.banner_image) {
        Helper.deleteFile(existingBanner.banner_image);
      }

      updatedFileName = req.files[0].filename;
    }

    await existingBanner.update({
      image_alt: banner_alt,
      order,
      banner_image: updatedFileName,
      meta_tags: meta_keywords,
      status,
      updatedBy: req.users?.id,
    });

    return Helper.response(
      true,
      "Banner updated successfully!",
      existingBanner,
      res,
      200
    );
  } catch (error) {
    console.error("Error updating banner:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.addcoupon = async (req, res) => {
  try {
    const {
      coupon_name,
      product_id,
      min_amount,
      max_discount,
      start_time,
      end_time,
      usage_per_user,
      coupon_count,
      status,
      description,
    } = req.body;

    if (!coupon_name) {
      return Helper.response(false, "name is required", [], res, 400);
    }
    const existingProductType = await coupons.findOne({
      where: { coupon_name },
    });
    if (existingProductType) {
      return Helper.response(false, "name already exists", [], res, 409);
    }

    const coupon = await coupons.create({
      coupon_name,
      product_id,
      min_amount,
      max_discount,
      start_time,
      end_time,
      usage_per_user,
      coupon_count,
      status,
      description,
      createdBy: req.users.id,
    });
    return Helper.response(true, "Coupon added successfully", coupon, res, 201);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error adding Coupon",
      res,
      500
    );
  }
};

exports.getcoupon = async (req, res) => {
  try {
    const Coupons = await coupons.findAll({
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Coupons.length == 0) {
      return Helper.response(false, "No Coupons found", [], res, 404);
    }

    const Data = await Promise.all(
      Coupons.map(async (item) => {
        const product = await Product.findOne({
          where: {
            id: item.product_id,
          },
          attributes: [
            [col("id"), "value"],
            [col("product_name"), "label"],
          ],
        });
        const user = await registered_user.findOne({
          where: {
            id: item.user_id,
          },
          attributes: [
            [col("id"), "value"],
            [fn("CONCAT", col("first_name"), " ", col("last_name")), "label"],
          ],
        });

        return {
          ...item,
          product_name: product?.label,
          products: product,
          user: user,
        };
      })
    );

    return Helper.response(
      true,
      "Coupons fetched successfully",
      Data,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching Coupons",
      res,
      500
    );
  }
};
exports.getcouponDD = async (req, res) => {
  try {
    const Units = await coupons.findAll({
      attributes: [
        [col("id"), "value"],
        [col("coupon_name"), "label"],
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No Coupons found", [], res, 404);
    }
    return Helper.response(
      true,
      "Coupons fetched successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching Coupons",
      res,
      500
    );
  }
};

exports.updatecoupon = async (req, res) => {
  try {
    const {
      id,
      coupon_name,
      status,
      product_id,
      description,
      min_amount,
      max_discount,
      start_time,
      end_time,
      usage_per_user,
      coupon_count,
      discount_type,
      user_id,
    } = req.body;
    if (!id) {
      return Helper.response(false, "ID is required", [], res, 400);
    }
    // if (!coupon_name) {
    //   return Helper.response(false, "coupon name is required", [], res, 400);
    // }

    const coupon = await coupons.findByPk(id);
    if (!coupon) {
      return Helper.response(false, "Coupon not found", [], res, 404);
    }

    coupon.coupon_name = coupon_name ?? coupon?.coupon_name;
    coupon.product_id = product_id ?? coupon?.product_id;
    (coupon.min_amount = min_amount ?? coupon?.min_amount),
      (coupon.max_discount = max_discount ?? coupon.max_discount);
    coupon.start_time = start_time ?? coupon?.start_time;
    coupon.end_time = end_time ?? coupon?.end_time;
    coupon.usage_per_user = usage_per_user ?? coupon?.usage_per_user;
    coupon.coupon_count = coupon_count ?? coupon?.coupon_count;
    coupon.status = status;
    coupon.description = description ?? coupon?.description;
    coupon.discount_type = discount_type ?? coupon?.discount_type;
    coupon.user_id = user_id ?? coupon?.user_id;
    coupon.updatedBy = req.users.id;
    await coupon.save();
    return Helper.response(
      true,
      "Coupon updated successfully",
      coupon,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error updating Unit",
      res,
      500
    );
  }
};

exports.deletecoupon = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return Helper.response(false, "coupons ID is required", [], res, 400);
    }
    const category = await coupons.findByPk(id);
    if (!category) {
      return Helper.response(false, "coupons not found", [], res, 404);
    }

    await coupons.destroy();
    return Helper.response(true, "coupons deleted successfully", [], res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error deleting coupons",
      res,
      500
    );
  }
};

exports.getstatedd = async (req, res) => {
  try {
    const district = await State.findAll({
      attributes: [
        [col("pk_uniqueid"), "value"],
        [col("state_name_en"), "label"],
      ],
      order: [["state_name_en", "ASC"]],
    });
    if (district.length > 0) {
      const data = await Promise.all(
        district.map(async (item) => {
          return {
            value: item.pk_uniqueid,
            label: item.state_name_en,
          };
        })
      );
      return Helper.response(true, "state list", district, res, 200);
    } else {
      return Helper.response(false, "state list not found", null, res, 200);
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return Helper.response(
      false,
      error.message,
      "Failed to get state Details",
      res,
      500
    );
  }
};

exports.getdistrictdd = async (req, res) => {
  try {
    const { state_id } = req.body;
    if (!state_id) {
      return Helper.response(false, "State Is Required", {}, res, 200);
    }
    const districts = await District.findAll({
      where: {
        state_id,
      },
      raw: true,
      attributes: [
        [col("pk_uniqueid"), "value"],
        [col("district_name_en"), "label"],
      ],
      order: [["district_name_en", "ASC"]],
    });
    if (districts.length > 0) {
      const data = await Promise.all(
        districts.map(async (item) => {
          return {
            value: item.value,
            label: item.label,
          };
        })
      );
      return Helper.response(true, "District list", data, res, 200);
    } else {
      return Helper.response(false, "District list not found", null, res, 200);
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return Helper.response(
      false,
      error.message,
      "Failed to get District Details",
      res,
      500
    );
  }
};

const calculateAge = (dob) => {
  const birth = new Date(dob);
  const diff = Date.now() - birth.getTime();
  return new Date(diff).getUTCFullYear() - 1970;
};

exports.addDoctor = async (req, res) => {
  try {
    const body = req.body;
    const files = req.files;

    // Required field check
    if (!body.name || !body.email || !body.gender || !body.dob)
      return Helper.response(false, "Missing required fields.", {}, res, 400);
  
    const start = new Date(`1970-01-01T${body?.start_time}:00`);
    const end = new Date(`1970-01-01T${body?.end_time}:00`);

    const diffMs = end - start; // difference in milliseconds
    const duration = Math.floor(diffMs / 60000); // convert ms → minutes

    let referral_code;
    let isUnique = false;

    // ensure uniqueness
    while (!isUnique) {
      referral_code = Helper.generateDoctorReferralCode(body.name);

      const exists = await Doctor.findOne({
        where: { refferalCode: referral_code },
      });
      if (!exists) isUnique = true;
    }

    // Build doctor data
    const doctorData = {
      loginId: 1, // Or req.user.id if using auth
      name: body.name??null,
      experience: body.experience??null,
      email: body.email??null,
      gender: body.gender??null,
      dob: new Date(body.dob),
      age: calculateAge(body.dob),
      // refferalCode: body.referral_code,
      address: body.address??null,
      cityId: body.city??null,
      stateId: body.state??null,
      pinCode: body.pin_code??null,
      phoneConsult: body.alt_mobile??null,
      phone: body.mobile??null,
      speciality: body.specialization??null,
      disease_id: body.disease_id??null,
      treatment_id: body.treatment_id??null,
      about: body.bio == 'null'?null :body.bio,
      registrationNo: body.registration??null,
      // registrationDate: new Date(body?.year_of_completion)??null,
      KYCstatus: "approved",
      password: "123456", // or hashed
      status: true,
      availability: body?.availability??null,
      credit: body?.credit??0,
      platform: body?.platform??null,
      end_time: body?.end_time??null,
      start_time: body?.start_time??null,
      online_consultation_fees: body?.online_consultation_fees??null,
      duration,
      profileImage: files.profile_img??null
        ? `${path.basename(files.profile_img[0].path)}`
        : null,
      panNo: files.pan_img ? `${path.basename(files.pan_img[0].path)}` : null,
      addharFrontImage: files.aadhaar_f_img
        ? `${path.basename(files.aadhaar_f_img[0].path)}`
        : null,
      addharBackImage: files.aadhaar_b_img
        ? `${path.basename(files.aadhaar_b_img[0].path)}`
        : null,
      cert_image: files.cert_img
        ? `${path.basename(files.cert_img[0].path)}`
        : null,
      known_language: body.known_language??null,
      refferalCode: referral_code??null,
      refferedBy: body.refferedBy??null,
      appointmentCharge: body?.appointment_fees ?? 0,
      // consultancyCharge: body?.online_consultation_fees ??0,
    };

    // Save doctor
    const doctor = await Doctor.create(doctorData);

    // Handle qualifications
    const qualifications = [];
    let index = 0;

    while (body[`qualifications[${index}].degree`]) {
      const certFile = files[`qualifications[${index}].certificate`]
        ? `${path.basename(
            files[`qualifications[${index}].certificate`][0].path
          )}`
        : null;

      qualifications.push({
        doctorId: doctor.id,
        degree: body[`qualifications[${index}].degree`],
        passing_year: new Date(body[`qualifications[${index}].passing_year`]),
        university: body[`qualifications[${index}].university`],
        certificate_no: body[`qualifications[${index}].certificate_no`],
        certificate: certFile,
        certificate_type: body[`qualifications[${index}].certificate_type`],
      });
      index++;
    }
    if (qualifications.length > 0)
      await Qualification.bulkCreate(qualifications);
    // Handle Experience
    const experience = [];
    let index1 = 0;

    while (body[`experiences[${index1}].organization`]) {
      let to_Date=body[`experiences[${index1}].to_date`]??null
      if(to_Date=='null'){
to_Date=null
      }
      
      experience.push({
        doctorId: doctor.id,
        organization: body[`experiences[${index1}].organization`],
        department_id:body[`experiences[${index1}].department_id`],
        from_date: body[`experiences[${index1}].from_date`],
        to_date: to_Date??null,
        is_current: body[`experiences[${index1}].is_current`],
      });
      index1++;
    }
    if (experience.length > 0) await Experience.bulkCreate(experience);

    return Helper.response(
      true,
      "Doctor added successfully",
      {
        doctor,
        qualifications,
      },
      res,
      200
    );
    // res.status(201).json({
    //   success: true,
    //   message: "Doctor added successfully",
    //   data: {
    //     doctor,
    //     qualifications,
    //   },
    // });
  } catch (error) {
    console.error("Error adding doctor:", error);
    return Helper.response(false, error?.errors?.[0]?.message, {}, res, 500);
  }
};

exports.addDoctorPersonal = async (req, res) => {
  // console.log("api called11");
  const t = await sequelize.transaction();
  try {
    const {
      referralCode,
      doctor_name,
      email,
      mobile,
      email_verified,
      mobile_verified,
      dob,
      gender,
      pincode,
      city,
      state,
      address,
      languages,
      bio,
      // profileImage,
      loginId,
    } = req.body;

    if (!doctor_name || !mobile || !dob || !gender) {
      return Helper.response(false, "Required fields missing", {}, res, 400);
    }

    let doctor = await Doctor.findOne({
      where: {
        [Op.or]: {
          phone: mobile,
          email,
        },
      },
      transaction: t,
    });

    // console.log(req.body,"body data111");

    const age = moment().diff(moment(dob, "YYYY-MM-DD"), "years");
   
    const files = req.files;
    let referredBy = null;
    if (referralCode) {
      const refDoctor = await Doctor.findOne({
        where: { refferalCode: referralCode },
      });
      if (refDoctor) referredBy = refDoctor.id;
    }
    // --------------------
    // PROFILE IMAGE
    // --------------------
    const profileImage =
      files?.profile_img && files.profile_img.length
        ? path.basename(files.profile_img[0].path)
        : null;   
    if (!doctor) {
      doctor = await Doctor.create(
        {
          loginId: 1,
          password: "123456",
          name: doctor_name,
          email: email || null,
          phone: mobile,
          dob: moment(dob, "YYYY-MM-DD").format("YYYY-MM-DD"),
          age,
          gender,
          pinCode: pincode,
          cityId: city,
          stateId: state,
          address,
          known_language: languages ?? null,
          about: bio,
          profileImage,
          refferedBy: referredBy,
          mobile_verified: mobile_verified,
          email_verified: email_verified,
          is_profile: "completed",
          regType: "doctor",
        },
        { transaction: t }
      );
    } else {
      await doctor.update(
        {
          name: doctor_name,
          email: email || doctor.email,
          dob: moment(dob, "YYYY-MM-DD").format("YYYY-MM-DD"),
          age,
          gender,
          pinCode: pincode,
          cityId: city,
          stateId: state,
          address,
          known_language: languages ?? doctor.known_language,
          about: bio,
          profileImage: profileImage || doctor.profileImage,
          mobile_verified: mobile_verified,
          email_verified: email_verified,
          is_profile: "completed",
        },
        { transaction: t }
      );
    }

    await t.commit();

    return Helper.response(
      true,
      "Doctor profile saved successfully",
      {
        id: doctor.id,
        name: doctor.name,
        mobile: doctor.phone,
        email: doctor.email,
        profile_completed: true,
      },
      res,
      200
    );
  } catch (error) {
    await t.rollback();
    console.error(error);
    return Helper.response(false, error?.errors[0]?.message, {}, res, 500);
  }
};

// exports.addDoctorProfessional = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const doctorId = req.users?.id || req.body.doctor_id;

//     const {
//       specializations = [],
//       qualifications = [],
//       experiences = [],
//       medical_council_number,
//       total_experince,
//     } = req.body;

//     if (!doctorId) {
//       return Helper.response(false, "Doctor id is required", {}, res, 400);
//     }
//     const files = req.files;
//     const doctor = await Doctor.findByPk(doctorId, { transaction: t });
//     if (!doctor) {
//       return Helper.response(false, "Doctor not found", {}, res, 404);
//     }

//     const certFile = files?.["council_certificate"]
//       ? `${path.basename(files?.["council_certificate"].path)}`
//       : null;

//     await doctor.update(
//       {
//         speciality: Array.isArray(specializations)
//           ? specializations.join(",")
//           : doctor.speciality,
//         registrationNo: medical_council_number || doctor.registrationNo,
//         experience: total_experince ??  doctor.experience,
//         is_profile: "completed",
//         cert_image: certFile,
//       },
//       { transaction: t }
//     );

//     if (qualifications.length) {
//       const qualificationExits = await Qualification.findOne({
//         where: { doctorId: doctorId },
//       });
//       if (qualificationExits) {
//         await Qualification.destroy({
//           where: { doctorId: doctorId },
//           transaction: t,
//         });
//       }

//       const qualificationRows = qualifications.map((q) => ({
//         doctorId: doctorId,
//         degree: q.degree,
//         university: q.institution,
//          certificate: certFile,
//         certificate_no: q.certificate_no,
//         certificate_type: q.certificate_type,
//         passing_year: q.year,
//       }));

//       await Qualification.bulkCreate(qualificationRows, {
//         transaction: t,
//       });
//     }

//     if (experiences.length) {
//       const ExperienceExits = await Experience.findOne({
//         where: { doctorId: doctorId },
//       });
//       if (ExperienceExits) {
//         await Experience.destroy({
//           where: { doctorId: doctorId },
//           transaction: t,
//         });
//       }

//       const experienceRows = experiences.map((e) => ({
//         doctorId: doctorId,
//         // position: e.position,
//         organization: e.organization,
//         from_date: e.start_date,
//         department_id: e.department_id,
//         to_date: e.end_date ? e.end_date : null,
//         is_current: e.currently_working,
//         status: true,
//       }));

//       await Experience.bulkCreate(experienceRows, {
//         transaction: t,
//       });
//     }

//     await t.commit();

//     return Helper.response(
//       true,
//       "Doctor professional details saved successfully",
//       {
//         doctor_id: doctorId,
//         step2_completed: true,
//       },
//       res,
//       200
//     );
//   } catch (error) {
//     await t.rollback();
//     console.error(error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

exports.addDoctorProfessional = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const doctorId = req.users?.id || req.body.doctor_id;

    const {
      specializations = [],
      qualifications = [],
      experiences = [],
      medical_council_number,
      total_experience
    } = req.body;

    if (!doctorId) {
      await t.rollback();
      return Helper.response(false, "Doctor id is required", {}, res, 400);
    }

    const doctor = await Doctor.findByPk(doctorId, { transaction: t });
    if (!doctor) {
      await t.rollback();
      return Helper.response(false, "Doctor not found", {}, res, 404);
    }

    let certFile = null;
    const files = req.files;

    if (
      files &&
      files["council_certificate"] &&
      Array.isArray(files["council_certificate"]) &&
      files["council_certificate"].length > 0 &&
      files["council_certificate"][0].path
    ) {
      certFile = path.basename(files["council_certificate"][0].path);
    }

    await doctor.update(
      {
        speciality: Array.isArray(specializations)
          ? specializations.join(",")
          : doctor.speciality,
        registrationNo: medical_council_number ?? doctor.registrationNo,
        experience: total_experience ?? doctor.experience,
        is_profile: "completed",
        cert_image: certFile ?? doctor.cert_image,
      },
      { transaction: t }
    );

    if (Array.isArray(qualifications) && qualifications.length > 0) {
      await Qualification.destroy({
        where: { doctorId },
        transaction: t,
      });

      const qualificationRows = qualifications.map((q) => ({
        doctorId,
        degree: q.degree,
        university: q.institution,
        certificate: certFile,
        certificate_no: q.council_certificate,
        certificate_type: q.certificate_type,
        passing_year: q.year,
      }));

      await Qualification.bulkCreate(qualificationRows, {
        transaction: t,
      });
    }

    if (Array.isArray(experiences) && experiences.length > 0) {
      await Experience.destroy({
        where: { doctorId },
        transaction: t,
      });

      const experienceRows = experiences.map((e) => ({
        doctorId,
        organization: e.organization,
        department_id: e.department_id,
        from_date: e.start_date,
        to_date: e.end_date || null,
        is_current: e.currently_working,
        status: true,
      }));

      await Experience.bulkCreate(experienceRows, {
        transaction: t,
      });
    }

    await t.commit();

    return Helper.response(
      true,
      "Doctor professional details updated successfully",
      {
        doctor_id: doctorId,
        step2_completed: true,
      },
      res,
      200
    );
  } catch (error) {
    await t.rollback();
    console.error("addDoctorProfessional error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.setDoctorAvailability = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const doctorId = req.users?.id; // from auth middleware

    if (!doctorId) {
      return Helper.response(false, "Doctor ID required", {}, res, 400);
    }

    const {
      slot_duration,
      online_consultation,
      online_fee,
      clinic_consultation,
      clinic_fee,
      availability,
    } = req.body;
    console.log(req.body);

    if (!slot_duration || !Array.isArray(availability)) {
      return Helper.response(
        false,
        "slot duration and Availability Is required",
        {},
        res,
        400
      );
    }

    await Doctor.update(
      {
        duration: slot_duration,
        online_consultation_fees: online_fee || 0,
        clinic_consultation: clinic_consultation || 0,
        clinic_fee: clinic_fee || 0,
        online_consultation: online_consultation || 0,
      },
      { where: { id: doctorId }, transaction: t }
    );

    await DoctorSlot.destroy({
      where: { doctorId, session_type: { [Op.in]: ["online"] } },
      transaction: t,
    });

    const slotRows = [];

    availability.forEach((dayObj) => {
      const day = dayObj.day?.toLowerCase();

      if (!Array.isArray(dayObj.slots)) return;

      dayObj.slots.forEach((slot) => {
        // ONLINE slots
        if (online_consultation === 1) {
          slotRows.push({
            doctorId,
            day,
            session_type: "online",
            start_time: slot.start_time,
            end_time: slot.end_time,
            duration: slot_duration,
            fees: online_fee || 0,
          });
        }

        if (clinic_consultation === 1) {
          slotRows.push({
            doctorId,
            day,
            session_type: "offline",
            start_time: slot.start_time,
            end_time: slot.end_time,
            duration: slot_duration,
            fees: clinic_fee || 0,
          });
        }
      });
    });

    if (!slotRows.length) {
      return Helper.response(false, "No slots to save", {}, res, 400);
    }
    //  console.log(slotRows,"slot row");

    // -------------------------------
    // Bulk insert
    // -------------------------------
    await DoctorSlot.bulkCreate(slotRows, { transaction: t });
    await t.commit();

    return Helper.response(
      true,
      "Doctor availability saved successfully",
      { total_slots: slotRows.length, step: "completed" },
      res,
      200
    );
  } catch (error) {
    await t.rollback();
    console.error("Doctor availability error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};
// exports.setDoctorAvailability = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const doctorId = req.users?.id; // from auth middleware

//     if (!doctorId) {
//       return Helper.response(false, "Doctor ID required", {}, res, 400);
//     }

//     const {
//       slot_duration,
//       online_consultation,
//       online_fee,
//       clinic_consultation,
//       clinic_fee,
//       availability,
//     } = req.body;
//      console.log(req.body);

//     if (!slot_duration || !Array.isArray(availability)) {
//       return Helper.response(false, "slot duration and Availability Is required", {}, res, 400);
//     }

//     await Doctor.update(
//       {
//         duration: slot_duration,
//         online_consultation_fees: online_fee || 0,
//         clinic_consultation: clinic_consultation || 0,
//         clinic_fee: clinic_fee || 0,
//         online_consultation: online_consultation || 0,
//       },
//       { where: { id: doctorId }, transaction: t }
//     );

//     await DoctorSlot.destroy({
//       where: { doctorId },
//       transaction: t,
//     });

//     const slotRows = [];

//     availability.forEach((dayObj) => {
//       const day = dayObj.day?.toLowerCase();

//       if (!Array.isArray(dayObj.slots)) return;

//       dayObj.slots.forEach((slot) => {
//         // ONLINE slots
//         if (online_consultation === 1) {
//           slotRows.push({
//             doctorId,
//             day,
//             session_type: "online",
//             start_time: slot.start_time,
//             end_time: slot.end_time,
//             duration: slot_duration,
//             fees: online_fee || 0,
//           });
//         }

//         if (clinic_consultation === 1) {
//           slotRows.push({
//             doctorId,
//             day,
//             session_type: "offline",
//             start_time: slot.start_time,
//             end_time: slot.end_time,
//             duration: slot_duration,
//             fees: clinic_fee || 0,
//           });
//         }
//       });
//     });

//     if (!slotRows.length) {
//       return Helper.response(false, "No slots to save", {}, res, 400);
//     }
//     //  console.log(slotRows,"slot row");

//     // -------------------------------
//     // Bulk insert
//     // -------------------------------
//     await DoctorSlot.bulkCreate(slotRows, { transaction: t });
//     await t.commit();

//     return Helper.response(
//       true,
//       "Doctor availability saved successfully",
//       { total_slots: slotRows.length,step:'completed' },
//       res,
//       200
//     );
//   } catch (error) {
//     await t.rollback();
//     console.error("Doctor availability error:", error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

exports.getallDoctorList = async (req, res) => {
  try {
    const qualification = await Qualification.findAll({
      raw: true,
      order: [["id", "desc"]],
      attributes: ["doctorId"],
    });
    let DoctorId = qualification.map((item) => item.doctorId);
    const data = await Doctor.findAll({
      raw: true,
      order: [["id", "desc"]],
      where: {
        id: {
          [Op.in]: DoctorId,
        },
      },
    });

    if (data.length === 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }

    const finalData = await Promise.all(
      data.map(async (item) => {
        // -----------------------------
        // Convert speciality into array
        // -----------------------------
        let specialityIds = [];

        if (item.speciality) {
          try {
            if (Array.isArray(item.speciality)) {
              specialityIds = item.speciality;
            } else if (typeof item.speciality === "string") {
              // JSON string?
              if (item.speciality.startsWith("["))
                specialityIds = JSON.parse(item.speciality);
              else
                specialityIds = item.speciality
                  .split(",")
                  .map((e) => +e.trim());
            } else {
              specialityIds = [item.speciality];
            }
          } catch (err) {
            specialityIds = [];
          }
        }

        let treatmentIds = [];

        if (item.treatment_id) {
          try {
            if (Array.isArray(item.treatment_id)) {
              treatmentIds = item.treatment_id;
            } else if (typeof item.treatment_id === "string") {
              // JSON string?
              if (item.treatment_id.startsWith("["))
                treatmentIds = JSON.parse(item.treatment_id);
              else
                treatmentIds = item.treatment_id
                  .split(",")
                  .map((e) => +e.trim());
            } else {
              treatmentIds = [item.treatment_id];
            }
          } catch (err) {
            treatmentIds = [];
          }
        }

        let DiseasesIds = [];

        if (item.disease_id) {
          try {
            if (Array.isArray(item.disease_id)) {
              DiseasesIds = item.disease_id;
            } else if (typeof item.disease_id === "string") {
              // JSON string?
              if (item.disease_id.startsWith("["))
                DiseasesIds = JSON.parse(item.disease_id);
              else
                DiseasesIds = item.disease_id.split(",").map((e) => +e.trim());
            } else {
              DiseasesIds = [item.disease_id];
            }
          } catch (err) {
            DiseasesIds = [];
          }
        }

        // -----------------------------
        // Get Qualification
        // -----------------------------
        const qualification_data = await Qualification.findAll({
          where: { doctorId: item.id },
          raw: true,
          order: [["id", "desc"]],
        });

        // -----------------------------
        // Get Speciality Labels
        // -----------------------------
        const specialityData =
          specialityIds.length > 0
            ? await speclization.findAll({
                where: {
                  id: { [Op.in]: specialityIds },
                },
                attributes: [
                  ["id", "value"],
                  ["name", "label"],
                ],
                raw: true,
                order: [["id", "desc"]],
              })
            : [];
        const DiseasesData =
          DiseasesIds.length > 0
            ? await Diseases.findAll({
                where: {
                  id: { [Op.in]: DiseasesIds },
                },
                attributes: [
                  ["id", "value"],
                  ["name", "label"],
                ],
                raw: true,
                order: [["id", "desc"]],
              })
            : [];
        const treatmentData =
          treatmentIds.length > 0
            ? await treatment_master.findAll({
                where: {
                  id: { [Op.in]: treatmentIds },
                },
                attributes: [
                  ["id", "value"],
                  ["name", "label"],
                ],
                raw: true,
                order: [["id", "desc"]],
              })
            : [];

        return {
          ...item,

          // Normalized fields
          profile_image: item.profileImage,
          referral_code: item.refferalCode,
          pin_code: item.pinCode,
          addhar_no: item.addharNo,
          university_name: item.universityName,
          registration_no: item.registrationNo,
          registration_date: item.registrationDate,
          father_name: item.fatherName,
          mother_name: item.motherName,
          pan_no: item.panNo,
          consultancy_charge: item.consultancyCharge,
          addhar_front_image: item.addharFrontImage,
          addhar_back_image: item.addharBackImage,
          text_consult: item.textConsult,
          phone_consult: item.phoneConsult,
          mobile: item.phone,
          KYC_status: item.KYCstatus,

          // Arrays
          qualification_data,
          speciality: specialityData,
          treatment_id: treatmentData,
          disease_id: DiseasesData,
          known_language: item.known_language
            ? Array.isArray(item.known_language)
              ? item.known_language
              : [item.known_language]
            : [],

          // Derived
          degree:
            qualification_data.length > 0
              ? qualification_data
                  .map((q) => q.degree)
                  .filter(Boolean)
                  .join(",")
              : null,
        };
      })
    );

    return Helper.response(
      true,
      "Data Found Successfully",
      finalData,
      res,
      200
    );
  } catch (error) {
    console.error("Error fetching doctor list:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

// exports.getallDoctorList = async (req, res) => {
//   try {
//     const data = await Doctor.findAll({
//       raw: true,

//       order: [["id", "desc"]],
//     });

//     if (data.length > 0) {
//       const finalData = await Promise.all(
//         data.map(async (item) => {
//           console.log(item.id,item.speciality);

//           const qualification_data =  item?.id ? await Qualification.findAll({
//             where: {
//               doctorId: item?.id,
//             },
//             raw: true,
//             order: [["id", "desc"]],
//           }) :null;
//           const speciality = item.speciality? await speclization.findAll({
//             where: {
//               id: {
//                 [Op.in]: item.speciality,
//               },
//             },
//             attributes: [
//               ["id", "value"],
//               ["name", "label"],
//             ],
//             raw: true,
//             order: [["id", "desc"]],
//           }):null;

//           return {
//             ...item,
//             profile_image: item?.profileImage,
//             referral_code: item?.refferalCode,
//             pin_code: item?.pinCode,
//             addhar_no: item?.addharNo,
//             university_name: item?.universityName,
//             registration_no: item?.registrationNo,
//             registration_date: item?.registrationDate,
//             father_name: item?.fatherName,
//             mother_name: item?.motherName,
//             pan_no: item?.panNo,
//             consultancy_charge: item?.consultancyCharge,
//             addhar_front_image: item?.addharFrontImage,
//             addhar_back_image: item?.addharBackImage,
//             text_consult: item?.textConsult,
//             phone_consult: item?.phoneConsult,
//             mobile: item?.phone,
//             qualification_data: qualification_data,
//             KYC_status: item?.KYCstatus,
//             speciality: speciality ?? 0,
//             known_language: [item?.known_language],
//             degree: qualification_data.length>0
//               ? qualification_data.map((item) => item?.degree).join(",")
//               : null,
//           };
//         })
//       );

//       return Helper.response(
//         true,
//         "Data Found Successfully",
//         finalData,
//         res,
//         200
//       );
//     } else {
//       return Helper.response(false, "No Data Found", [], res, 200);
//     }
//   } catch (error) {
//     console.error("Error adding doctor:", error);
//     return Helper.response(false, error?.message, {}, res, 500);
//   }
// };

exports.getallDoctordd = async (req, res) => {
  try {
    const data = await Doctor.findAll({
      raw: true,
      attributes: [
        [col("id"), "value"],
        [col("name"), "label"],
      ],
      order: [["id", "desc"]],
    });

    if (data.length > 0) {
      return Helper.response(true, "Data Found Successfully", data, res, 200);
    } else {
      return Helper.response(false, "No Data Found", [], res, 200);
    }
  } catch (error) {
    console.error("Error adding doctor:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.getallDoctorById = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await Doctor.findAll({
      raw: true,
      where: {
        id,
      },
      order: [["id", "desc"]],
    });
    if (data.length > 0) {
      const finalData = await Promise.all(
        data.map(async (doctor) => {
          const qualification_data = await Qualification.findAll({
            where: { doctorId: doctor.id },
            raw: true,
          });

          let experience_data = await Experience.findAll({
            where: { doctorId: doctor.id },
            raw: true,
          });
          // const treament_data = await treatment_master.findAll({
          //   where: { id: doctor.treatment_id },
          //     attributes: [
          //           ["id", "value"],
          //           ["name", "label"],
          //         ],
          //   raw: true,
          // });

          experience_data = await Promise.all(
            experience_data.map(async (exp) => {
              let department_data = null;

              if (exp.department_id) {
                department_data = await department.findOne({
                  where: { id: exp.department_id },
                  attributes: [
                    ["id", "value"],
                    ["name", "label"],
                  ],
                  raw: true,
                });
              }

              return {
                ...exp,
                department: department_data,
              };
            })
          );

          /* ================= State ================= */
          const state = doctor.stateId
            ? await State.findOne({
                where: { statename: doctor.stateId },
                attributes: [
                  ["pk_uniqueid", "value"],
                  ["state_name_en", "label"],
                ],
                raw: true,
              })
            : null;

          /* ================= District ================= */
          const district =
            doctor.cityId && doctor.cityId !== null
              ? await District.findOne({
                  where: { districtname: doctor.cityId },
                  attributes: [
                    ["pk_uniqueid", "value"],
                    ["district_name_en", "label"],
                  ],
                  raw: true,
                })
              : null;

          /* ================= Specialization ================= */
          let specialization = [];
          if (doctor.speciality) {
            const specialityIds = Helper.parseIds(doctor.speciality);

            specialization = await speclization.findAll({
              where: {
                id: { [Op.in]: specialityIds },
              },
              attributes: [
                ["id", "value"],
                ["name", "label"],
              ],
              order: [["id", "desc"]],
              raw: true,
            });
          }
          /* ================= Specialization ================= */
          let treament_data = [];
          if (doctor.treatment_id) {
            const treatment_Ids = Helper.parseIds(doctor.treatment_id);

            treament_data = await treatment_master.findAll({
              where: {
                id: { [Op.in]: treatment_Ids },
              },
              attributes: [
                ["id", "value"],
                ["name", "label"],
              ],
              order: [["id", "desc"]],
              raw: true,
            });
          }
          //    let disease_data = await Diseases.findAll({
          //   where: { id: doctor.disease_id },
          //  attributes: [
          //           ["id", "value"],
          //           ["name", "label"],
          //         ],
          //   raw: true,
          // });
          /* ================= Specialization ================= */
          let disease_data = [];
          if (doctor.disease_id) {
            const disease_Ids = Helper.parseIds(doctor.disease_id);

            disease_data = await Diseases.findAll({
              where: {
                id: { [Op.in]: disease_Ids },
              },
              attributes: [
                ["id", "value"],
                ["name", "label"],
              ],
              order: [["id", "desc"]],
              raw: true,
            });
          }

          /* ================= Change Request ================= */
          const changeRequested = await DoctorChangeRequest.findOne({
            where: { doctor_id: doctor.id },
            attributes: ["keys", "remark"],
            raw: true,
          });

          /* ================= Final Response ================= */
          return {
            ...doctor,

            profile_image: doctor.profileImage ?? null,
            profile_image: doctor.profileImage ?? null,

            referral_code:
              doctor.refferalCode &&
              doctor.refferalCode !== "null" &&
              doctor.refferalCode !== "undefined"
                ? doctor.refferalCode
                : null,

            pin_code: doctor.pinCode ?? null,
            addhar_no: doctor.addharNo ?? null,
            university_name: doctor.universityName ?? null,
            registration_no: doctor.registrationNo ?? null,
            registration_date: doctor.registrationDate ?? null,
            father_name: doctor.fatherName ?? null,
            mother_name: doctor.motherName ?? null,
            pan_no: doctor.panNo ?? null,

            consultancy_charge: doctor.consultancyCharge ?? null,

            addhar_front_image: doctor.addharFrontImage ?? null,
            addhar_back_image: doctor.addharBackImage ?? null,

            text_consult: doctor.textConsult ?? null,
            phone_consult: doctor.phoneConsult ?? null,

            mobile: doctor.phone ?? null,

            qualification_data,
            experience_data,
            treatment_id: treament_data,
            disease_id: disease_data,

            state,
            city: district,

            specialization,

            known_language: doctor.known_language
              ? doctor.known_language.split(",")
              : [],

            cert_image: doctor.cert_image ?? null,

            start_time: doctor.start_time ?? null,
            end_time: doctor.end_time ?? null,

            appointment_fees: doctor.appointmentCharge ?? 0,

            keys: changeRequested?.keys ?? null,
            remark: changeRequested?.remark ?? null,
          };
        })
      );

      return Helper.response(
        true,
        "Data Found Successfully",
        finalData[0],
        res,
        200
      );
    } else {
      return Helper.response(false, "No Data Found", [], res, 200);
    }
  } catch (error) {
    console.error("Error adding doctor:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.addspeclization = async (req, res) => {
  try {
    const { name, status = true } = req.body;

    if (!name) {
      return Helper.response(false, "speclization is required", [], res, 400);
    }
    const existingProductType = await speclization.findOne({ where: { name } });
    if (existingProductType) {
      return Helper.response(
        false,
        "speclization name already exists",
        [],
        res,
        409
      );
    }

    const unit = await speclization.create({
      name,
      status,
      createdBy: req.users.id,
    });
    return Helper.response(
      true,
      "speclization added successfully",
      unit,
      res,
      201
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error adding speclization",
      res,
      500
    );
  }
};
exports.getAllspeclization = async (req, res) => {
  try {
    const Units = await speclization.findAll({
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No speclization found", [], res, 404);
    }
    return Helper.response(
      true,
      "speclization fetched successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching speclization",
      res,
      500
    );
  }
};

exports.getAllspeclizationDD = async (req, res) => {
  try {
    const Units = await speclization.findAll({
      attributes: [
        [col("id"), "value"],
        [col("name"), "label"],
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No speclization found", [], res, 404);
    }
    return Helper.response(
      true,
      "speclization fetched successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching speclization",
      res,
      500
    );
  }
};

exports.updatespeclization = async (req, res) => {
  try {
    const { id, name, status } = req.body;
    if (!id) {
      return Helper.response(false, "ID is required", [], res, 400);
    }
    // if (!name) {
    //   return Helper.response(false, "Salt name is required", [], res, 400);
    // }

    const Units = await speclization.findByPk(id);
    if (!Units) {
      return Helper.response(false, "Speclization not found", [], res, 404);
    }

    Units.name = name || Units.name;
    Units.status = status;
    Units.updatedBy = req.users.id;
    await Units.save();
    return Helper.response(
      true,
      "Speclization updated successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error updating Speclization",
      res,
      500
    );
  }
};

exports.deletespeclization = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return Helper.response(false, "Salt ID is required", [], res, 400);
    }
    const category = await speclization.findByPk(id);
    if (!category) {
      return Helper.response(false, "Salt not found", [], res, 404);
    }

    await speclization.destroy();
    return Helper.response(true, "Salt deleted successfully", [], res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error deleting Salt",
      res,
      500
    );
  }
};

exports.updateDoctor = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      id,
      referral_code,
      name,
      email,
      mobile,
      alt_mobile,
      dob,
      year_of_completion,
      gender,
      experience,
      registration,
      bio,
      state,
      city,
      pin_code,
      known_language,
      specialization,
      address,
      start_time,
      online_consultation_fees,
      end_time,
      availability,
      status,
      is_feature,
      disease_id,
      treatment_id,
      // consultancyCharge,
      appointment_fees,
    } = req.body;

    const body = req.body;
    const files = req.files;

    if (!id) {
      return Helper.response(false, "Doctor ID is required", {}, res, 400);
    }

    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return Helper.response(false, "Doctor not found", {}, res, 404);
    }

    const duration = Helper.calculateDuration(start_time, end_time);
    const updatedData = {
      refferalCode: referral_code ?? doctor?.referral_code,
      name: name ?? doctor?.name,
      email: email ?? doctor?.email,
      phone: mobile ?? doctor?.phone,
      phoneConsult: alt_mobile ?? doctor?.alt_mobile,
      is_feature: is_feature ?? doctor?.is_feature,
      address: address ?? doctor?.address,
      known_language: known_language ?? doctor?.known_language,
      experience: experience ?? doctor?.experience,
      speciality: specialization ?? doctor?.speciality,
      about: bio ?? doctor?.about,
      registrationNo: registration ?? doctor?.registrationNo,
      pinCode: pin_code ?? doctor?.pinCode,
      stateId: state ?? doctor?.stateId,
      cityId: city ?? doctor?.cityId,
      gender: gender ?? doctor?.gender,
      year_of_completion: year_of_completion ?? doctor?.year_of_completion,
      availability: availability ?? doctor?.availability,
      end_time: end_time ?? doctor?.end_time,
      start_time: start_time ?? doctor?.start_time,
      online_consultation_fees:
        online_consultation_fees ?? doctor?.online_consultation_fees,
      duration: duration ?? doctor?.duration,
      dob: dob ? new Date(dob) : doctor?.dob,
      status: status ?? doctor?.status,
      disease_id: disease_id ?? doctor.disease_id,
      treatment_id: treatment_id ?? doctor.treatment_id,
      // consultancyCharge: consultancyCharge ?consultancyCharge : doctor?.consultancyCharge,
      appointmentCharge: appointment_fees ?? doctor?.appointmentCharge,
      profileImage: files?.profile_img
        ? path.basename(files.profile_img[0].path)
        : doctor.profileImage,

      panNo: files?.pan_img
        ? path.basename(files.pan_img[0].path)
        : doctor.panNo,

      addharFrontImage: files?.aadhaar_f_img
        ? path.basename(files.aadhaar_f_img[0].path)
        : doctor.addharFrontImage,

      addharBackImage: files?.aadhaar_b_img
        ? path.basename(files.aadhaar_b_img[0].path)
        : doctor.addharBackImage,

      cert_image: files?.cert_img
        ? path.basename(files.cert_img[0].path)
        : doctor.cert_image,
    };

    await doctor.update(updatedData, { transaction: t });

    const oldQualifications = await Qualification.findAll({
      where: { doctorId: id },
      raw: true,
      transaction: t,
    });

    const qualifications = [];

    let index = 0;
    while (body[`qualifications[${index}].degree`]) {
      const degree = body[`qualifications[${index}].degree`];
      const certificate_no = body[`qualifications[${index}].certificate_no`];
      const certificate_type =
        body[`qualifications[${index}].certificate_type`];
      const university = body[`qualifications[${index}].university`];
      const passingYearRaw = body[`qualifications[${index}].passing_year`];

      const passing_year =
        passingYearRaw && !isNaN(Date.parse(passingYearRaw))
          ? new Date(passingYearRaw)
          : null;

      const oldQual = oldQualifications.find(
        (q) =>
          (degree && q.degree === degree) ||
          (certificate_no && q.certificate_no === certificate_no)
      );

      const certFile = files?.[`qualifications[${index}].certificate`]?.[0]
        ?.path
        ? path.basename(files[`qualifications[${index}].certificate`][0].path)
        : oldQual?.certificate
        ? oldQual.certificate.replace(/^.*\/upload\//, "") // remove URL path if necessary
        : null;

      qualifications.push({
        doctorId: id,
        degree,
        passing_year,
        university: university || null,
        certificate_no: certificate_no || null,
        certificate: certFile,
        certificate_type: certificate_type || null,
      });

      index++;
    }

    if (Array.isArray(body.qualifications) && body.qualifications.length > 0) {
      for (let i = 0; i < body.qualifications.length; i++) {
        const q = body.qualifications[i];

        const oldQual = oldQualifications.find(
          (oq) =>
            (q.degree && oq.degree === q.degree) ||
            (q.certificate_no && oq.certificate_no === q.certificate_no)
        );

        const certFile = files?.[`qualifications[${i}].certificate`]?.[0]?.path
          ? path.basename(files[`qualifications[${i}].certificate`][0].path)
          : oldQual?.certificate
          ? oldQual.certificate.replace(/^.*\/upload\//, "")
          : null;

        qualifications.push({
          doctorId: id,
          degree: q.degree,
          passing_year:
            q.passing_year && !isNaN(Date.parse(q.passing_year))
              ? new Date(q.passing_year)
              : oldQual?.passing_year || null,
          university: q.university || oldQual?.university || null,
          certificate_no: q.certificate_no || oldQual?.certificate_no || null,
          certificate: certFile,
          certificate_type:
            q.certificate_type || oldQual?.certificate_type || null,
        });
      }
    }

    if (qualifications.length > 0) {
      await Qualification.destroy({
        where: { doctorId: id },
        transaction: t,
      });
      await Qualification.bulkCreate(qualifications, { transaction: t });
    }

    const oldExperiences = await Experience.findAll({
      where: { doctorId: id },
      raw: true,
      transaction: t,
    });
    const experiences = [];

    let expIndex = 0;
    while (body[`experiences[${expIndex}].organization`]) {
      const organization = body[`experiences[${expIndex}].organization`];
      const department_id = body[`experiences[${expIndex}].department_id`];
      const from_date = body[`experiences[${expIndex}].from_date`];
      const to_date = body[`experiences[${expIndex}].to_date`];
      const is_current = body[`experiences[${expIndex}].is_current`] === "true";

      experiences.push({
        doctorId: id,
        organization,
        department_id: department_id || null,
        from_date:
          from_date && !isNaN(Date.parse(from_date))
            ? new Date(from_date)
            : null,
        to_date:
          to_date && !isNaN(Date.parse(to_date)) ? new Date(to_date) : null,
        is_current,
      });

      expIndex++;
    }
    if (experiences.length > 0) {
      await Experience.destroy({
        where: { doctorId: id },
        transaction: t,
      });

      await Experience.bulkCreate(experiences, { transaction: t });
    }

    await t.commit();

    return Helper.response(
      true,
      "Doctor details updated successfully.",
      doctor,
      res,
      200
    );
  } catch (error) {
    await t.rollback();
    console.error("Error updating doctor:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.userDropDown = async (req, res) => {
  try {
    const User = await registered_user.findAll({
      attributes: [
        [col("id"), "value"],
        [fn("CONCAT", col("first_name"), " ", col("last_name")), "label"],
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (User.length === 0) {
      return Helper.response(false, "No User found", [], res, 404);
    }
    return Helper.response(true, "User fetched successfully", User, res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching User",
      res,
      500
    );
  }
};

exports.addDoctorSlots = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { doctor_id, slots, sync, type } = req.body;

    if (!doctor_id || !slots || Object.keys(slots).length === 0) {
      return Helper.response(
        false,
        "doctor_id and slots are required",
        [],
        res,
        400
      );
    }

    const doctor = await Doctor.findOne({
      where: {
        id: doctor_id,
      },
    });
    if (!doctor) {
      return Helper.response(false, "Doctor not found", [], res, 404);
    }

    await DoctorSlot.destroy({
      where: { doctorId: doctor_id, session_type: type },
      transaction: t,
    });

    const allSlots = [];

    for (const [day, daySlots] of Object.entries(slots)) {
      for (const slot of daySlots) {
        allSlots.push({
          doctorId: doctor_id,
          day,
          duration: parseInt(slot.duration, 10),
          start_time: slot.start_time,
          end_time: slot.end_time,
          whatsApp: slot?.whatsApp,
          fees: parseFloat(slot.fees || 0),
          session_type: type || "offline", // Default: offline
          clinic_name: slot.clinic_name || null,
          clinic_address: slot.clinic_address || null,
          is_online: slot.session_type == "online" ? true : false,
          sync: sync ? true : false,
        });
      }
    }

    // Bulk insert all slots
    const savedSlots = await DoctorSlot.bulkCreate(allSlots, {
      transaction: t,
    });
    await t.commit();

    return Helper.response(
      true,
      "Doctor slots added successfully",
      savedSlots,
      res,
      200
    );
  } catch (err) {
    await t.rollback();
    console.error("Error adding doctor slots:", err);
    return Helper.response(
      false,
      err?.message || "Failed to add doctor slots",
      [],
      res,
      500
    );
  }
};

// exports.addClinic = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     const { doctor_id } = req.body;

//     if (!doctor_id) {
//       return Helper.response(false, "Doctor ID is required", [], res, 400);
//     }

//     const doctor = await Doctor.findOne({ where: { id: doctor_id } });
//     if (!doctor) {
//       return Helper.response(false, "Invalid doctor ID", [], res, 404);
//     }

//     // Days list
//     const days = [
//       "monday",
//       "tuesday",
//       "wednesday",
//       "thursday",
//       "friday",
//       "saturday",
//       "sunday",
//     ];

//     // helper → extract uploaded file
//     const getFile = (field) => {
//       if (!req.files) return null;
//       const file = req.files.find((f) => f.fieldname === field);
//       return file ? file.filename : null;
//     };

//     const finalSlots = [];

//     for (const day of days) {
//       const slotKey = `slots.${day}.0.fees`; // check if day exists in payload

//       if (req.body[slotKey] === undefined) continue; // ❗skip days not provided

//       let index = 0;

//       const slot_id = req.body[`slots.${day}.${index}.id`] || null;

//       const clinic_name = req.body[`slots.${day}.${index}.clinic_name`] || null;
//       const clinic_address =
//         req.body[`slots.${day}.${index}.clinic_address`] ||
//         req.body[`slots.${day}.${index}.full_address`] ||
//         null;

//       const fees = req.body[`slots.${day}.${index}.fees`] || 0;
//       const emergency_fees =
//         req.body[`slots.${day}.${index}.emergency_fees`] || 0;

//       const pin_code = req.body[`slots.${day}.${index}.pin_code`] || null;
//       const address = req.body[`slots.${day}.${index}.address`] || null;

//       const img1 = getFile(`slots.${day}.${index}.image_url_1`);
//       const img2 = getFile(`slots.${day}.${index}.image_url_2`);

//       let slotRecord = null;

//       if (slot_id) {
//         // ********** UPDATE **********
//         const clinicRecord = await clinic.findOne({
//           where: { id: slot_id, doctorId: doctor_id },
//           transaction: t,
//         });

//         if (!clinicRecord) {
//           await t.rollback();
//           return Helper.response(false, "Invalid Slot ID", [], res, 404);
//         }

//         slotRecord = await clinicRecord.update(
//           {
//             day,
//             session_type: "offline",
//             clinic_name,
//             clinic_address,
//             fees,
//             emergency_fees,
//             pin_code,
//             address,
//             clinic_image_1: img1 || clinicRecord.clinic_image_1,
//             clinic_image_2: img2 || clinicRecord.clinic_image_2,
//           },
//           { transaction: t }
//         );
//       } else {
//         // ********** CREATE **********
//         slotRecord = await clinic.create(
//           {
//             doctorId: doctor_id,
//             day,
//             session_type: "offline",
//             clinic_name,
//             clinic_address,
//             fees,
//             emergency_fees,
//             pin_code,
//             address,
//             clinic_image_1: img1,
//             clinic_image_2: img2,
//           },
//           { transaction: t }
//         );
//       }

//       finalSlots.push(slotRecord);
//     }

//     await t.commit();
//     return Helper.response(
//       true,
//       "Clinic saved successfully",
//       finalSlots,
//       res,
//       200
//     );
//   } catch (error) {
//     console.error("Clinic Error:", error);
//     await t.rollback();
//     return Helper.response(false, error.message, [], res, 500);
//   }
// };

// exports.addClinic = async (req, res) => {
//   const transaction = await sequelize.transaction();
//   try {
//     const { doctor_id, type = "offline" } = req.body;

//     if (!doctor_id) {
//       return Helper.response(false, "doctor_id is required", [], res, 400);
//     }

//     if (type !== "offline") {
//       return Helper.response(false, "Invalid session type", [], res, 400);
//     }

//     const getFile = (field) => {
//       if (!req.files) return null;
//       const file = req.files.find((f) => f.fieldname == field);
//       return file ? file.filename : null;
//     };

//     // ----------------------------------
//     // 1. Fetch existing clinics (ONCE)
//     // ----------------------------------
//     const existingClinics = await clinic.findAll({
//       where: {
//         doctorId: doctor_id,
//         session_type: "offline",
//       },
//       attributes: ["id", "clinic_image_1", "clinic_image_2"],
//       transaction,
//       raw: true,
//     });

//     const existingClinicMap = {};
//     existingClinics.forEach((c) => {
//       existingClinicMap[c.id] = c;
//     });

//     const incomingSlotIds = [];
//     const savedSlots = [];

//     // ----------------------------------
//     // 2. Loop through request slots
//     // ----------------------------------
//     let index = 0;
//     while (true) {
//       const prefix = `slots.${index}`;

//       if (!req.body[`${prefix}.clinic_name`] && !req.body[`${prefix}.fees`])
//         break;

//       const slotId = req.body[`${prefix}.id`] || null;
//       if (slotId) incomingSlotIds.push(Number(slotId));

//       const existingSlot = slotId ? existingClinicMap[slotId] : null;

//       const image1 = getFile(`${prefix}.image_url_1`);
//       const image2 = getFile(`${prefix}.image_url_2`);

//       const slotData = {
//         doctorId: doctor_id,
//         session_type: "offline",
//         clinic_name: req.body[`${prefix}.clinic_name`] || null,
//         clinic_address: req.body[`${prefix}.clinic_address`] || null,
//         fees: req.body[`${prefix}.fees`] || null,
//         emergency_fees: req.body[`${prefix}.emergency_fees`] || null,
//         pin_code: req.body[`${prefix}.pin_code`] || null,
//         time: req.body[`${prefix}.time`] || null,
//         day: index,

//         // image replace logic
//         clinic_image_1: image1 || existingSlot?.clinic_image_1 || null,
//         clinic_image_2: image2 || existingSlot?.clinic_image_2 || null,
//       };

//       let result;
//       if (slotId) {
//         // UPDATE
//         await clinic.update(slotData, {
//           where: { id: slotId },
//           transaction,
//         });
//         result = { id: slotId, ...slotData };
//       } else {
//         // CREATE
//         result = await clinic.create(slotData, { transaction });
//       }

//       savedSlots.push(result);
//       index++;
//     }

//     // ----------------------------------
//     // 3. DELETE removed clinics (SYNC)
//     // ----------------------------------
//     const existingIds = existingClinics.map((c) => c.id);

//     const clinicsToDelete = existingIds.filter(
//       (id) => !incomingSlotIds.includes(id)
//     );

//     if (clinicsToDelete.length > 0) {
//       await clinic.destroy({
//         where: { id: clinicsToDelete },
//         transaction,
//       });
//     }

//     await transaction.commit();

//     return Helper.response(
//       true,
//       "Offline doctor slots saved successfully",
//       { doctor_id, type, slots: savedSlots },
//       res,
//       200
//     );
//   } catch (error) {
//     await transaction.rollback();
//     console.error("Save offline slots error:", error);
//     return Helper.response(
//       false,
//       error.message || "Failed to save slots",
//       [],
//       res,
//       500
//     );
//   }
// };

exports.addClinic = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { doctor_id, type = "offline", sync = false } = req.body;

    if (!doctor_id) {
      return Helper.response(false, "doctor_id is required", [], res, 400);
    }

    if (type !== "offline") {
      return Helper.response(false, "Invalid session type", [], res, 400);
    }

    // -------- FILE HANDLER ----------
    const getFile = (field) => {
      if (!req.files) return null;
      const file = req.files.find((f) => f.fieldname === field);
      return file ? file.filename : null;
    };

    // -------- CREATE / UPDATE CLINIC ----------
    const clinicData = {
      doctorId: doctor_id,
      session_type: "offline",
      clinic_name: req.body["slots.monday.0.clinic_name"],
      clinic_address: req.body["slots.monday.0.clinic_address"],
      pin_code: req.body["slots.monday.0.pin_code"],
      clinic_image_1: getFile("slots.monday.0.image_url_1"),
      clinic_image_2: getFile("slots.monday.0.image_url_2"),
      sync,
    };

    let clinicRecord = await clinic.findOne({
      where: { doctorId: doctor_id, session_type: "offline" },
      transaction,
    });

    if (clinicRecord) {
      await clinicRecord.update(clinicData, { transaction });
    } else {
      clinicRecord = await clinic.create(clinicData, { transaction });
    }

    // -------- SLOT SAVE ----------
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    const savedSlots = [];

    for (const day of days) {
      let index = 0;

      while (true) {
        const base = `slots.${day}.${index}`;

        if (!req.body[`${base}.start_time`]) break;

        const slotData = {
          doctorId: doctor_id,
          clinicId: clinicRecord.id,
          day,
          session_type: "offline",
          clinic_name: req.body[`${base}.clinic_name`],
          clinic_address: req.body[`${base}.clinic_address`],
          start_time: req.body[`${base}.start_time`],
          end_time: req.body[`${base}.end_time`],
          duration: req.body[`${base}.duration`],
          fees: req.body[`${base}.fees`] || 0,
          emergency_fees: req.body[`${base}.emergency_fees`],
          pin_code: req.body[`${base}.pin_code`],
          clinic_image_1:
            getFile(`${base}.image_url_1`) || clinicRecord.clinic_image_1,
          clinic_image_2:
            getFile(`${base}.image_url_2`) || clinicRecord.clinic_image_2,
          sync,
        };

        const slotId = req.body[`${base}.id`];

        let slot;
        if (slotId) {
          await DoctorSlot.update(slotData, {
            where: { id: slotId },
            transaction,
          });
          slot = { id: slotId, ...slotData };
        } else {
          slot = await DoctorSlot.create(slotData, { transaction });
        }

        savedSlots.push(slot);
        index++;
      }
    }

    await transaction.commit();

    return Helper.response(
      true,
      "Clinic & slots saved successfully",
      { clinic: clinicRecord, slots: savedSlots },
      res,
      200
    );
  } catch (error) {
    await transaction.rollback();
    console.error("Add clinic error:", error);
    return Helper.response(false, error.message, [], res, 500);
  }
};

exports.getDoctorSlot = async (req, res) => {
  try {
    const { doctor_id, type = "online", sync = false } = req.body;

    if (!doctor_id) {
      return Helper.response(false, "doctor_id is required", [], res, 400);
    }

    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return Helper.response(false, "Doctor not found", [], res, 404);
    }

    const where = {
      doctorId: doctor_id,
      session_type: type,
    };

    let slots;
    let groupedSlots;

    // ================= OFFLINE (FLAT LIST) =================
    if (type === "offline") {
      slots = await DoctorSlot.findAll({
        where,
        order: [["day", "ASC"]],
        raw: true,
      });

      groupedSlots = slots.map((slot) => ({
        id: slot.id,
        day: slot.day,
        start_time: slot.start_time,
        end_time: slot.end_time,
        duration: slot.duration?.toString(),
        fees: parseFloat(slot.fees).toFixed(2),
        emergency_fees: slot.emergency_fees,
        session_type: slot.session_type,
        clinic_name: slot.clinic_name || null,
        clinic_address: slot.clinic_address || null,
        clinic_image_1: slot.clinic_image_1 || null,
        clinic_image_2: slot.clinic_image_2 || null,
        whatsApp: slot.whatsApp || null,
        pin_code: slot.pin_code || null,
      }));
    }

    // ================= ONLINE / OTHER (GROUPED BY DAY) =================
    else {
      slots = await DoctorSlot.findAll({
        where,
        order: [
          ["day", "ASC"],
          ["start_time", "ASC"],
        ],
        raw: true,
      });

      groupedSlots = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      };

      for (const slot of slots) {
        if (groupedSlots[slot.day]) {
          groupedSlots[slot.day].push({
            id: slot.id,
            start_time: slot.start_time,
            end_time: slot.end_time,
            duration: slot.duration?.toString(),
            fees: parseFloat(slot.fees).toFixed(2),
            emergency_fees: slot.emergency_fees,
            session_type: slot.session_type,
            clinic_name: slot.clinic_name || null,
            clinic_address: slot.clinic_address || null,
            clinic_image_1: slot.clinic_image_1 || null,
            clinic_image_2: slot.clinic_image_2 || null,
            whatsApp: slot.whatsApp || null,
            pin_code: slot.pin_code || null,
          });
        }
      }
    }

    const responseData = {
      doctor_id,
      type,
      sync,
      slots: groupedSlots,
    };

    return Helper.response(
      true,
      "Doctor slots fetched successfully",
      responseData,
      res,
      200
    );
  } catch (error) {
    console.error("Error fetching doctor slots:", error);
    return Helper.response(
      false,
      error.message || "Failed to fetch doctor slots",
      [],
      res,
      500
    );
  }
};

// exports.getDoctorSlot = async (req, res) => {
//   try {
//     const { doctor_id, type = "online", sync = false } = req.body;

//     if (!doctor_id) {
//       return Helper.response(false, "doctor_id is required", [], res, 400);
//     }

//     const doctor = await Doctor.findByPk(doctor_id);
//     if (!doctor) {
//       return Helper.response(false, "Doctor not found", [], res, 404);
//     }

//     const where = { doctorId: doctor_id };
//     if (type) where.session_type = type;
//     let slots;
//     let groupedSlots = {
//       monday: [],
//       tuesday: [],
//       wednesday: [],
//       thursday: [],
//       friday: [],
//       saturday: [],
//       sunday: [],
//     };
//     if (type == "offline") {
//       groupedSlots = [];
//       slots = await clinic.findAll({
//         where,
//         order: [
//           ["day", "ASC"],
//           // ["start_time", "ASC"],
//         ],
//         raw: true,
//       });
//       groupedSlots = slots;
//     } else {
//       slots = await DoctorSlot.findAll({
//         where,
//         order: [
//           ["day", "ASC"],
//           ["start_time", "ASC"],
//         ],
//         raw: true,
//       });
//       // Initialize grouped slots by weekday

//       for (const slot of slots) {
//         if (groupedSlots[slot.day]) {
//           groupedSlots[slot.day].push({
//             duration: slot.duration?.toString(),
//             start_time: slot.start_time,
//             end_time: slot.end_time,
//             fees: parseFloat(slot.fees).toFixed(2),
//             session_type: slot.session_type,
//             clinic_name: slot.clinic_name || null,
//             clinic_address: slot?.clinic_address || null,
//             clinic_image_1: slot?.clinic_image_1 || null,
//             clinic_image_2: slot?.clinic_image_2 || null,
//             emergency_fees: slot?.emergency_fees || null,
//             whatsApp: slot?.whatsApp || null,
//             pin_code: slot?.pin_code || null,
//             id: slot.id || null,
//           });
//         }
//       }
//     }

//     const responseData = {
//       doctor_id,
//       type,
//       sync, // added here
//       slots: groupedSlots,
//     };

//     return Helper.response(
//       true,
//       "Doctor slots fetched successfully",
//       responseData,
//       res,
//       200
//     );
//   } catch (error) {
//     console.error("Error fetching doctor slots:", error);
//     return Helper.response(
//       false,
//       error?.message || "Failed to fetch doctor slots",
//       [],
//       res,
//       500
//     );
//   }
// };

exports.updateDoctorSlots = async (req, res) => {
  try {
    const doctorId = req.body.doctorId;
    const { to_all_online, slots, fees, type } = req.body;

    if (!doctorId) {
      return Helper.response(false, "doctorId is required", {}, res, 400);
    }

    if (!slots || typeof slots !== "object") {
      return Helper.response(false, "Invalid slots data", {}, res, 400);
    }

    const slotRecord = await DoctorSlot.findOne({
      where: { doctorId, type: type || "offline" },
    });

    let data;

    if (slotRecord) {
      await slotRecord.update({
        to_all_online,
        slots,
        fees,
        type: type || "offline",
      });
      data = slotRecord;
    } else {
      data = await DoctorSlot.create({
        doctorId,
        to_all_online,
        slots,
        fees,
        type: type || "offline",
      });
    }

    return Helper.response(
      true,
      "Doctor slots updated successfully",
      data,
      res,
      200
    );
  } catch (error) {
    console.error("Error updating doctor slots:", error);
    return Helper.response(false, error?.message, error, res, 500);
  }
};

exports.addOfflineDoctorSlots = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { doctor_id, whatsApp } = req.body;

    if (!doctor_id) {
      return Helper.response(false, "Doctor ID is required", [], res, 400);
    }

    const doctor = await Doctor.findOne({ where: { id: doctor_id } });
    if (!doctor) {
      return Helper.response(false, "Invalid doctor ID", [], res, 404);
    }

    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    // Helper to extract uploaded file
    const getFile = (field) => {
      if (!req.files) return null;
      const file = req.files.find((f) => f.fieldname === field);
      return file ? file.filename : null;
    };

    const finalSlots = [];

    for (const day of days) {
      let index = 0;

      while (req.body[`slots.${day}.${index}.start_time`] !== undefined) {
        const slot_id = req.body[`slots.${day}.${index}.id`];

        const clinic_name =
          req.body[`slots.${day}.${index}.clinic_name`] || null;
        const clinic_address =
          req.body[`slots.${day}.${index}.clinic_address`] ||
          req.body[`slots.${day}.${index}.full_address`] ||
          null;

        const emergency_fees =
          req.body[`slots.${day}.${index}.emergency_fees`] || 0;
        const fees = req.body[`slots.${day}.${index}.fees`] || 0;
        const pin_code = req.body[`slots.${day}.${index}.pin_code`] || null;
        const address = req.body[`slots.${day}.${index}.address`] || null;

        const start_time = req.body[`slots.${day}.${index}.start_time`] || null;
        const end_time = req.body[`slots.${day}.${index}.end_time`] || null;

        let duration = req.body[`slots.${day}.${index}.duration`];
        if (!duration || duration == 0) {
          duration =
            start_time && end_time
              ? moment(end_time, "HH:mm").diff(
                  moment(start_time, "HH:mm"),
                  "minutes"
                )
              : 0;
        }

        // Uploaded images (only if present)
        const new_img1 = getFile(`slots.${day}.${index}.image_url_1`);
        const new_img2 = getFile(`slots.${day}.${index}.image_url_2`);

        let slotRecord;

        if (slot_id) {
          // ----------- UPDATE -------------
          slotRecord = await DoctorSlot.findOne({
            where: { id: slot_id, doctorId: doctor_id },
          });

          if (!slotRecord) {
            return Helper.response(false, "Invalid Slot ID", [], res, 404);
          }

          await slotRecord.update(
            {
              day,
              session_type: "offline",
              clinic_name,
              clinic_address,
              fees,
              emergency_fees,
              pin_code,
              start_time,
              end_time,
              duration,
              clinic_image_1: new_img1 || slotRecord.clinic_image_1,
              clinic_image_2: new_img2 || slotRecord.clinic_image_2,
              address,
              whatsApp: whatsApp,
            },
            { transaction: t }
          );
        } else {
          slotRecord = await DoctorSlot.create(
            {
              doctorId: doctor_id,
              day,
              session_type: "offline",
              clinic_name,
              clinic_address,
              fees,
              emergency_fees,
              pin_code,
              start_time,
              end_time,
              duration,
              clinic_image_1: new_img1,
              clinic_image_2: new_img2,
              address,
              whatsApp: whatsApp,
            },
            { transaction: t }
          );
        }

        finalSlots.push(slotRecord);
        index++;
      }
    }

    await t.commit();
    return Helper.response(
      true,
      "Offline doctor slots saved successfully",
      finalSlots,
      res,
      200
    );
  } catch (error) {
    console.error("Doctor Slot Error:", error);
    await t.rollback();
    return Helper.response(false, error.message, [], res, 500);
  }
};

// exports.addOfflineDoctorSlots = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     const { doctor_id, sync } = req.body;

//     if (!doctor_id) {
//       return Helper.response(false, "Doctor ID is required", [], res, 400);
//     }

//     const doctor = await Doctor.findOne({ where: { id: doctor_id } });
//     if (!doctor) {
//       return Helper.response(false, "Invalid doctor ID", [], res, 404);
//     }

//     const syncFlag = sync == 1 ? true : false;

//     // If sync = 1 delete all old slots
//     if (syncFlag) {
//       await DoctorSlot.destroy(
//         { where: { doctorId: doctor_id } },
//         { transaction: t }
//       );
//     }

//     const days = [
//       "monday", "tuesday", "wednesday", "thursday",
//       "friday", "saturday", "sunday"
//     ];

//     const finalSlots = [];

//     for (const day of days) {
//       let index = 0;

//       while (req.body[`slots.${day}.${index}.start_time`] != undefined) {
//         const session = "offline";

//         const slot_id = req.body[`slots.${day}.${index}.id`] || null;

//         const clinic_name = req.body[`slots.${day}.${index}.clinic_name`] || null;
//         const clinic_address =
//           req.body[`slots.${day}.${index}.clinic_address`] ||
//           req.body[`slots.${day}.${index}.full_address`] || null;

//         const emergency_fees = req.body[`slots.${day}.${index}.emergency_fees`] || 0;
//         const fees = req.body[`slots.${day}.${index}.fees`] || 0;
//         const pin_code = req.body[`slots.${day}.${index}.pin_code`] || null;
//         const address = req.body[`slots.${day}.${index}.address`] || null;

//         const start_time = req.body[`slots.${day}.${index}.start_time`] || null;
//         const end_time = req.body[`slots.${day}.${index}.end_time`] || null;

//         // Duration
//         let duration = req.body[`slots.${day}.${index}.duration`];
//         if (!duration || duration == 0) {
//           if (start_time && end_time) {
//             duration = moment(end_time, "HH:mm").diff(moment(start_time, "HH:mm"), "minutes");
//           } else {
//             duration = 0;
//           }
//         }
// // let slotRecord = null;
// // if (slot_id) {
// //   slotRecord = await DoctorSlot.findOne({ where: { id: slot_id, doctorId: doctor_id } });
// // }

// // images

// //        const getFile = (field) => {
// //   if (!req.files) return null;
// //   return req.files[field] ? req.files[field][0] : null;
// // };

// // const image_url_1_file = getFile(`slots.${day}.${index}.image_url_1`);
// // const image_url_2_file = getFile(`slots.${day}.${index}.image_url_2`);

// // const clinic_image_1 = image_url_1_file
// //   ? image_url_1_file.filename
// //   :  null;

// // const clinic_image_2 = image_url_2_file
// //   ? image_url_2_file.filename
// //   :  null;

//         let slotRecord;
// const image_url_1_file = req.files?.find(
//   (f) => f.fieldname == `slots.${day}.${index}.image_url_1`
// );

// const image_url_2_file = req.files?.find(
//   (f) => f.fieldname == `slots.${day}.${index}.image_url_2`
// );

// let clinic_image_1 = image_url_1_file
//   ? image_url_1_file.filename
//   : null;

// let clinic_image_2 = image_url_2_file
//   ? image_url_2_file.filename
//   : null;

//         if (slot_id) {
//           // UPDATE SLOT
//           slotRecord = await DoctorSlot.findOne({ where: { id: slot_id, doctorId: doctor_id } });

//           if (slotRecord) {
//             const image_url_1_file = req.files?.find(
//   (f) => f.fieldname === `slots.${day}.${index}.image_url_1`
// );

// const image_url_2_file = req.files?.find(
//   (f) => f.fieldname === `slots.${day}.${index}.image_url_2`
// );

// const clinic_image_1 = image_url_1_file
//   ? image_url_1_file.filename
//   : slotRecord?.clinic_image_1;

// const clinic_image_2 = image_url_2_file
//   ? image_url_2_file.filename
//   : slotRecord?.clinic_image_2;
//             await slotRecord.update(
//               {
//                 day,
//                 session_type: session,
//                 clinic_name,
//                 clinic_address,
//                 fees,
//                 emergency_fees,
//                 pin_code,
//                 start_time,
//                 end_time,
//                 duration,
//                 clinic_image_1: clinic_image_1 || slotRecord.clinic_image_1,
//                 clinic_image_2: clinic_image_2 || slotRecord.clinic_image_2,
//                 address
//               },
//               { transaction: t }
//             );
//           }

//         } else {
//           // CREATE NEW SLOT
//           slotRecord = await DoctorSlot.create(
//             {
//               doctorId: doctor_id,
//               day,
//               session_type: session,
//               clinic_name,
//               clinic_address,
//               fees,
//               emergency_fees,
//               pin_code,
//               start_time,
//               end_time,
//               duration,
//               clinic_image_1,
//               clinic_image_2,
//             },
//             { transaction: t }
//           );
//         }

//         finalSlots.push(slotRecord);
//         index++;
//       }
//     }

//     await t.commit();

//     return Helper.response(
//       true,
//       "Offline doctor slots saved successfully",
//       finalSlots,
//       res,
//       200
//     );

//   } catch (error) {
//     console.error("Doctor Slot Error:", error);
//     await t.rollback();
//     return Helper.response(false, error.message, [], res, 500);
//   }
// };

exports.getAllcitydd = async (req, res) => {
  try {
    const city = await CityMaster.findAll({
      attributes: [
        [col("id"), "value"],
        [col("name"), "label"],
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (city.length === 0) {
      return Helper.response(false, "No City found", [], res, 404);
    }
    return Helper.response(true, "City fetched successfully", city, res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching City",
      res,
      500
    );
  }
};

exports.adddepartment = async (req, res) => {
  try {
    const { name, status = true } = req.body;

    if (!name) {
      return Helper.response(false, "department is required", [], res, 400);
    }
    const existingdepartment = await department.findOne({ where: { name } });
    if (existingdepartment) {
      return Helper.response(
        false,
        "department name already exists",
        [],
        res,
        409
      );
    }

    const unit = await department.create({
      name,
      status,
      createdBy: req.users.id,
    });
    return Helper.response(
      true,
      "department added successfully",
      unit,
      res,
      201
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error adding department",
      res,
      500
    );
  }
};
exports.getAlldepartment = async (req, res) => {
  try {
    const Units = await department.findAll({
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No department found", [], res, 404);
    }
    return Helper.response(
      true,
      "department fetched successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching department",
      res,
      500
    );
  }
};

exports.getAlldepartmentDD = async (req, res) => {
  try {
    const Units = await department.findAll({
      attributes: [
        [col("id"), "value"],
        [col("name"), "label"],
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No department found", [], res, 404);
    }
    return Helper.response(
      true,
      "department fetched successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching department",
      res,
      500
    );
  }
};

exports.updatedepartment = async (req, res) => {
  try {
    const { id, name, status } = req.body;
    if (!id) {
      return Helper.response(false, "ID is required", [], res, 400);
    }
    // if (!name) {
    //   return Helper.response(false, "Salt name is required", [], res, 400);
    // }

    const Units = await department.findByPk(id);
    if (!Units) {
      return Helper.response(false, "department not found", [], res, 404);
    }

    Units.name = name || Units.name;
    Units.status = status;
    Units.updatedBy = req.users.id;
    await Units.save();
    return Helper.response(
      true,
      "department updated successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error updating department",
      res,
      500
    );
  }
};

exports.deletespeclization = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return Helper.response(false, "department ID is required", [], res, 400);
    }
    const category = await department.findByPk(id);
    if (!category) {
      return Helper.response(false, "department not found", [], res, 404);
    }

    await department.destroy();
    return Helper.response(
      true,
      "department deleted successfully",
      [],
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error deleting department",
      res,
      500
    );
  }
};

exports.addtreatment = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      return Helper.response(false, "Salt is required", [], res, 400);
    }
    const existingProductType = await treatment_master.findOne({
      where: { name },
    });
    if (existingProductType) {
      return Helper.response(
        false,
        "treatment name already exists",
        [],
        res,
        409
      );
    }

    const unit = await treatment_master.create({
      name,
      status,
      createdBy: req.users.id,
    });
    return Helper.response(true, "Salt added successfully", unit, res, 201);
  } catch (error) {
    return Helper.response(false, error.message, "Error adding Salt", res, 500);
  }
};

exports.getAlltreatment = async (req, res) => {
  try {
    const Units = await treatment_master.findAll({
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No treatment found", [], res, 404);
    }
    return Helper.response(
      true,
      "treatment fetched successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching treatment",
      res,
      500
    );
  }
};
exports.getAlltreatmentDD = async (req, res) => {
  try {
    const Units = await treatment_master.findAll({
      attributes: [
        [col("id"), "value"],
        [col("name"), "label"],
      ],
      // order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No treatment found", [], res, 404);
    }
    return Helper.response(
      true,
      "treatment fetched successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching treatment_master",
      res,
      500
    );
  }
};

exports.updatetreatment_master = async (req, res) => {
  try {
    const { id, name, status } = req.body;
    if (!id) {
      return Helper.response(false, "ID is required", [], res, 400);
    }
    // if (!name) {
    //   return Helper.response(false, "Salt name is required", [], res, 400);
    // }

    const Units = await treatment_master.findByPk(id);
    if (!Units) {
      return Helper.response(false, "treatment_master not found", [], res, 404);
    }

    Units.name = name || Units.name;
    Units.status = status;
    Units.updatedBy = req.users.id;
    await Units.save();
    return Helper.response(
      true,
      "treatment_master updated successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error updating Unit",
      res,
      500
    );
  }
};

exports.deletetreatment = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return Helper.response(
        false,
        "treatment_master ID is required",
        [],
        res,
        400
      );
    }
    const category = await treatment_master.findByPk(id);
    if (!category) {
      return Helper.response(false, "treatment_master not found", [], res, 404);
    }

    await treatment_master.destroy({
      where: {
        id,
      },
    });

    return Helper.response(
      true,
      "treatment_master deleted successfully",
      [],
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error deleting treatment_master",
      res,
      500
    );
  }
};

exports.getProductDD = async (req, res) => {
  try {
    const categories = await Product.findAll({
      attributes: [
        [col("id"), "value"],
        [col("product_name"), "label"],
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (categories.length == 0) {
      return Helper.response(false, "No Product found", [], res, 200);
    }
    return Helper.response(
      true,
      "Product fetched successfully",
      categories,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching Product",
      res,
      500
    );
  }
};

exports.deleteClinic = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return Helper.response(false, "Clinic ID is required", [], res, 400);
    }
    const deleteClinic = await clinic.findByPk(id);
    if (!deleteClinic) {
      return Helper.response(false, "Clinic not found", [], res, 404);
    }
    await clinic.destroy({
      where: { id },
    });
    return Helper.response(true, "Clinic deleted successfully", [], res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error deleting Clinic",
      res,
      500
    );
  }
};
exports.createPatientFromDoctor = async (req, res) => {
  try {
    const { mobile, name, gender, age } = req.body;
    const doctorId = req.users?.id;
    if (!doctorId) {
      return Helper.response(false, "Doctor not authenticated", {}, res, 401);
    }

    const checkMobile = await registered_user.count({ where: { mobile } });
    if (checkMobile === 0) {
      if (!name || typeof name !== "string") {
        return { first_name: "", last_name: "" };
      }

      const parts = name.trim().replace(/\s+/g, " ").split(" ");
      const createUser = await registered_user.create({
        first_name: parts[0] || "",
        last_name: parts.length > 1 ? parts.slice(1).join(" ") : "",
        mobile,
        gender,
      });
      if (createUser) {
        const createRecord = await TodayPatient.create({
          name,
          doctor_id: doctorId,
          mobile,
          gender,
          age,
          is_prescription_added: false,
          visit_date: moment().format("YYYY-MM-DD"),
          user_id: createUser.id,
        });
        if (createRecord) {
          return Helper.response(
            true,
            "Patient created successfully",
            createRecord,
            res,
            201
          );
        }
      }
    } else {
      const checkMobile = await registered_user.count({ where: { mobile } });
      if (checkMobile > 0) {
        const existingUser = await registered_user.findOne({ where: { mobile } });
        const createRecord = await TodayPatient.create({
          name,
          doctor_id: doctorId,
          mobile,
          gender,
          age,
          is_prescription_added: false,
          visit_date: moment().format("YYYY-MM-DD"),
          user_id: existingUser.id,
        });
        if (createRecord) {
          return Helper.response(
            true,
            "Patient created successfully",
            createRecord,
            res,
            201
          );
        }
      }
    }
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error creating Patient",
      res,
      500
    );
  }
};

exports.listTodayPatientsForDoctor = async (req, res) => {
  try {
    const doctorId = req.users?.id;

    if (!doctorId) {
      return Helper.response(false, "Doctor not authenticated", {}, res, 401);
    }

    const today = moment().format("YYYY-MM-DD");

    const patients = await TodayPatient.findAll({
      where: {
        doctor_id: doctorId,
        visit_date: today,
      },
      order: [["createdAt", "DESC"]],
    });

    return Helper.response(
      true,
      "Today's patient list fetched successfully",
      patients,
      res,
      200
    );
  } catch (error) {
    console.error("listTodayPatientsForDoctor:", error);
    return Helper.response(
      false,
      error.message,
      "Error fetching patient list",
      res,
      500
    );
  }
};
