const Diseases = require("../../../model/diseases.js");
const Ingredient = require("../../../model/ingredient.js");
const ProductType = require("../../../model/product_type.js");
const Unit = require("../../../model/unit.js");
const Brand = require("../../../model/brand.js");
const Helper = require("../../helper/helper.js");
const Salt = require("../../../model/salt.js");
const Product = require("../../../model/product.js");
const product_gallery = require("../../../model/product_gallery.js");
const { Op, col } = require("sequelize");
const sequelize = require("../../connection/connection.js");
const ingredient = require("../../../model/ingredient.js");
const Category = require("../../../model/category.js");
const slugify = require("slugify");
const banner = require("../../../model/banner.js");
const coupons = require("../../../model/coupon.js");
const State = require("../../../model/state.js");
const District = require("../../../model/district.js");
const Doctor = require("../../../model/doctor.js");
const Qualification = require("../../../model/qualification.js");
const path = require("path");
const speclization = require("../../../model/specilization.js");
const { diff } = require("util");
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
      const newDoc = await Ingredient.create({
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
    const { id, name, status, description} = req.body;

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
    if (Coupons.length === 0) {
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
        return {
          ...item,
          product_name: product?.label,
          products: product,
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

    coupon.coupon_name = coupon_name;
    coupon.product_id = product_id;
    (coupon.min_amount = min_amount), (coupon.max_discount = max_discount);
    coupon.start_time = start_time;
    coupon.end_time = end_time;
    coupon.usage_per_user = usage_per_user;
    coupon.coupon_count = coupon_count;
    coupon.status = status;
    coupon.description = description;
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
    // return res.status(400).json({ success: false, message: "Missing required fields." });
    // Convert to Date objects
    const start = new Date(`1970-01-01T${body?.start_time}:00`);
    const end = new Date(`1970-01-01T${body?.end_time}:00`);

    const diffMs = end - start; // difference in milliseconds
    const duration = Math.floor(diffMs / 60000); // convert ms → minutes
    // Build doctor data
    const doctorData = {
      loginId: 1, // Or req.user.id if using auth
      name: body.name,
      experience: body.experience,
      email: body.email,
      gender: body.gender,
      dob: new Date(body.dob),
      age: calculateAge(body.dob),
      refferalCode: body.referral_code,
      address: body.address,
      cityId: body.city,
      stateId: body.state,
      pinCode: body.pin_code,
      phoneConsult: body.alt_mobile,
      phone: body.mobile,
      speciality: body.specialization,
      about: body.bio,
      registrationNo: body.registration,
      registrationDate: new Date(body.year_of_completion),
      KYCstatus: "pending",
      password: "123456", // or hashed
      status: true,
      availability: body?.availability,
      end_time: body?.end_time,
      start_time: body?.start_time,
      online_consultation_fees: body?.online_consultation_fees,
      duration,
      profileImage: files.profile_img
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
      known_language: body.known_language,
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
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.getallDoctorList = async (req, res) => {
  try {
    const data = await Doctor.findAll({
      raw: true,

      order: [["id", "desc"]],
    });

    if (data.length > 0) {
      const finalData = await Promise.all(
        data.map(async (item) => {
          const qualification_data = await Qualification.findAll({
            where: {
              doctorId: item?.id,
            },
            raw: true,
            order: [["id", "desc"]],
          });
          const speciality = await speclization.findAll({
            where: { id: item.speciality },
            attributes: [
              ["id", "value"],
              ["name", "label"],
            ],

            raw: true,
            order: [["id", "desc"]],
          });

          return {
            ...item,
            profile_image: item?.profileImage,
            referral_code: item?.refferalCode,
            pin_code: item?.pinCode,
            addhar_no: item?.addharNo,
            university_name: item?.universityName,
            registration_no: item?.registrationNo,
            registration_date: item?.registrationDate,
            father_name: item?.fatherName,
            mother_name: item?.motherName,
            pan_no: item?.panNo,
            consultancy_charge: item?.consultancyCharge,
            addhar_front_image: item?.addharFrontImage,
            addhar_back_image: item?.addharBackImage,
            text_consult: item?.textConsult,
            phone_consult: item?.phoneConsult,
            mobile: item?.phone,
            qualification_data: qualification_data,
            KYC_status: item?.KYCstatus,
            speciality: speciality ?? 0,
            known_language: [item?.known_language],
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
    } else {
      return Helper.response(false, "No Data Found", [], res, 200);
    }
  } catch (error) {
    console.error("Error adding doctor:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

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
        data.map(async (item) => {
          // Fetch qualification list
          const qualification_data = await Qualification.findAll({
            where: { doctorId: item?.id },
            raw: true,
          });
          let state, district, speciality;
          if (item.stateId) {
            // Fetch state details
            state = await State.findOne({
              where: { pk_uniqueid: item.stateId },
              attributes: [
                ["pk_uniqueid", "value"],
                ["state_name_en", "label"],
              ],
              raw: true,
            });
          }
          if (item.cityId != "undefined") {
            district = await District.findOne({
              where: { pk_uniqueid: item?.cityId },
              attributes: [
                ["pk_uniqueid", "value"],
                ["district_name_en", "label"],
              ],
              raw: true,
            });
          }
          if (item.speciality) {
            // Fetch specialization details
            speciality = item?.speciality
              ? await speclization.findOne({
                  where: { id: item.speciality },
                  attributes: [
                    ["id", "value"],
                    ["name", "label"],
                  ],
                  order: [["id", "desc"]],
                  raw: true,
                })
              : null;
          }

          return {
            ...item,
            profile_image: item?.profileImage ?? null,
            refferal_code: item?.refferalCode ?? null,
            pin_code: item?.pinCode ?? null,
            addhar_no: item?.addharNo ?? null,
            university_name: item?.universityName ?? null,
            registration_no: item?.registrationNo ?? null,
            registration_date: item?.registrationDate ?? null,
            father_name: item?.fatherName ?? null,
            mother_name: item?.motherName ?? null,
            pan_no: item?.panNo ?? null,
            consultancy_charge: item?.consultancyCharge ?? null,
            addhar_front_image: item?.addharFrontImage ?? null,
            addhar_back_image: item?.addharBackImage ?? null,
            text_consult: item?.textConsult ?? null,
            phone_consult: item?.phoneConsult ?? null,
            mobile: item?.phone ?? null,
            qualification_data,
            state,
            city: district,
            specialization: speciality,
            known_language: item?.known_language ? [item.known_language] : [],
            cert_image: item?.cert_image ?? null,
            start_time: item?.start_time ?? null,
            end_time: item?.end_time ?? null,
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

    const duration = Helper.calculateDuration(start_time, end_time); // convert ms → minutes
    const updatedData = {
      refferalCode: referral_code,
      name,
      email,
      phone: mobile,
      phoneConsult: alt_mobile,
      address,
      known_language,
      experience,
      speciality: specialization,
      about: bio,
      registrationNo: registration,
      pinCode: pin_code,
      stateId: state,
      cityId: city,
      gender,
      year_of_completion,
      availability: availability,
      end_time: end_time,
      start_time: start_time,
      online_consultation_fees: online_consultation_fees,
      duration,
      dob: dob ? new Date(dob) : null,

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

    await Qualification.destroy({
      where: { doctorId: id },
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
      await Qualification.bulkCreate(qualifications, { transaction: t });
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
