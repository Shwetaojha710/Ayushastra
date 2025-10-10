const sequelize = require("../../connection/connection");
const Helper = require("../../helper/helper");

exports.addDoctor=async(req,res)=>{
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
}



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