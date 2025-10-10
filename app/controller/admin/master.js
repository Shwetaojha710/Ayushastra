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
const {  State } = require("../../../model/state.js");
const {  District } = require("../../../model/district.js");
// product_gallery

exports.addDiseases = async (req, res) => {
  const { name, status } = req.body;
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
        status,
        doc_type: file.mimetype,
        image: file.filename,
        createdBy: req.users?.id,
        updatedBy: req.users?.id,
        status: status || "active",
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
    const { id, name, status } = req.body;

    if (!id) {
      return Helper.response(false, "Diseases ID is required", [], res, 400);
    }
    if (!name) {
      return Helper.response(false, "Diseases name is required", [], res, 400);
    }

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
    if (!name) {
      return Helper.response(false, "Unit name is required", [], res, 400);
    }

    const Units = await Unit.findByPk(id);
    if (!Units) {
      return Helper.response(false, "Unit not found", [], res, 404);
    }

    Units.name = name || Units.name;
    Units.status = status || Units.status;
    Units.updatedBy = req.users.id;
    await Unit.save();
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
    if (!name) {
      return Helper.response(false, "Unit name is required", [], res, 400);
    }

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
    const { name, status } = req.body;

    if (!name) {
      return Helper.response(false, "Ingredient is required", [], res, 400);
    }

    const unit = await Ingredient.create({
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

exports.updateIngredient = async (req, res) => {
  try {
    const { id, name, status } = req.body;
    if (!id) {
      return Helper.response(false, "ID is required", [], res, 400);
    }
    if (!name) {
      return Helper.response(
        false,
        "Ingredient name is required",
        [],
        res,
        400
      );
    }

    const Units = await Ingredient.findByPk(id);
    if (!Units) {
      return Helper.response(false, "Ingredient not found", [], res, 404);
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
    if (!name) {
      return Helper.response(
        false,
        "ProductType name is required",
        [],
        res,
        400
      );
    }

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
    if (!name) {
      return Helper.response(false, "Salt name is required", [], res, 400);
    }

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
      where:{
        id
      }
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
    if(req.body.product_name){
      
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
      isFragile: req.body.fragile ? req.body.fragile === "true": product?.fragile
      ,
      gst: req.body.gst,
      hsn: req.body.hsn,
      sku: req.body.sku,
      stock: req.body.stock,
      isPublish: req.body.publish ? req.body.publish === "true" : product?.publish,
      unit: req.body.unit,
      status: req.body.status ?  req.body.status === "true" : product?.status,
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
      description
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
          product_name: product?.label ,
          products:product
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
    const { id, coupon_name, status,product_id,description,min_amount,max_discount,start_time,end_time,usage_per_user,coupon_count } = req.body;
    if (!id) {
      return Helper.response(false, "ID is required", [], res, 400);
    }
    if (!coupon_name) {
      return Helper.response(false, "coupon name is required", [], res, 400);
    }

    const coupon = await coupons.findByPk(id);
    if (!coupon) {
      return Helper.response(false, "Coupon not found", [], res, 404);
    }

      coupon.coupon_name=coupon_name
      coupon.product_id=product_id
      coupon.min_amount=min_amount,
      coupon.max_discount=max_discount
      coupon.start_time=start_time
      coupon.end_time=end_time
      coupon.usage_per_user=usage_per_user
      coupon.coupon_count=coupon_count
      coupon.status=status
      coupon.description=description
    coupon.updatedBy = req.users.id;
    await coupon.save();
    return Helper.response(true, "Coupon updated successfully", coupon, res, 200);
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
        [col("statename"), "label"],
      ],
      order: [["statename", "ASC"]],
    });
    if (district.length > 0) {
      const data = await Promise.all(
        district.map(async (item) => {
          return {
            value: item.pk_uniqueid,
            label: item.statename,
          };
        })
      );
      return response(true, "state list", district, res, 200);
    } else {
      return response(false, "state list not found", null, res, 200);
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return response(
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
    const districts = await District.findAll({
      attributes: [
        [col("pk_uniqueid"), "value"],
        [col("districtname"), "label"],
      ],
      order: [["districtname", "ASC"]],
    });
    if (district.length > 0) {
      const data = await Promise.all(
        district.map(async (item) => {
          return {
            value: item.pk_uniqueid,
            label: item.districtname,
          };
        })
      );
      return response(true, "District list", district, res, 200);
    } else {
      return response(false, "District list not found", null, res, 200);
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return response(
      false,
      error.message,
      "Failed to get District Details",
      res,
      500
    );
  }
};