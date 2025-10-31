const banner = require("../../../model/banner");
const blog = require("../../../model/blog");
const Brand = require("../../../model/brand");
const Category = require("../../../model/category");
const Consultancy = require("../../../model/consultancy");
const Diseases = require("../../../model/diseases");
const Doctor = require("../../../model/doctor");
const ingredient = require("../../../model/ingredient");
const Product = require("../../../model/product");
const product_gallery = require("../../../model/product_gallery");
const ProductType = require("../../../model/product_type");
const Qualification = require("../../../model/qualification");
const Unit = require("../../../model/unit");
const video = require("../../../model/video");
const Coupon = require("../../../model/coupon");
const Helper = require("../../helper/helper");
const { Op, col } = require("sequelize");
const wishlist = require("../../../model/wishlist");

exports.getPublicBanner = async (req, res) => {
  try {
    const bannerData = await banner.findAll({
      order: [["id", "desc"]],
      raw: true,
      where: {
        status: true,
      },
      order: [["order", "asc"]],
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
exports.getPublicproduct = async (req, res) => {
  try {
    let { categories, diseases, ingredients, prince_range } = req.body;
    let whereCondition = {};
    // handle disease filter
    if (diseases && diseases.length > 0) {
      const diseaseConditions = diseases.map((d) => ({
        disease_id: {
          [Op.or]: [
            { [Op.eq]: String(d) },
            { [Op.like]: `${String(d)},%` },
            { [Op.like]: `%,${String(d)},%` },
            { [Op.like]: `%,${String(d)}` },
          ],
        },
      }));

      if (!whereCondition[Op.or]) whereCondition[Op.or] = [];
      whereCondition[Op.or].push(...diseaseConditions);
    }

    // handle ingredient filter
    if (ingredients && ingredients.length > 0) {
      const ingredientConditions = ingredients.map((i) => ({
        ingredient_id: {
          [Op.or]: [
            { [Op.eq]: String(i) },
            { [Op.like]: `${String(i)},%` },
            { [Op.like]: `%,${String(i)},%` },
            { [Op.like]: `%,${String(i)}` },
          ],
        },
      }));

      if (!whereCondition[Op.or]) whereCondition[Op.or] = [];
      whereCondition[Op.or].push(...ingredientConditions);
    }

    // handle category filter
    if (categories && categories.length > 0) {
      whereCondition.category_id = { [Op.in]: categories };
    }
    if (prince_range && prince_range.length > 0) {
      whereCondition.mrp = { [Op.between]: prince_range };
    }

    const bannerData = await Product.findAll({
      order: [["id", "desc"]],
      raw: true,
    });
    if (bannerData.length == 0) {
      return Helper.response(false, "No Data Found", {}, res, 200);
    }
    const products = await Product.findAll({
      where: whereCondition,
      order: [["id", "ASC"]],
      raw: true,
    });

    if (products.length === 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }

    const finalData = await Promise.all(
      products.map(async (item) => {

        const couponData= item.id  ? await Coupon.findAll({
          where: {
            product_id: item?.id ,
            status: true,
          },
          raw: true,
          order: [["id", "ASC"]],
        }):[]; 

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
          const wishlists=await wishlist.findOne({
            where:{
              productId:item.id
            }
          })

          console.log(wishlists,"wishlistswishlistswishlistswishlists");
          
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
          ingredient: await ingredient.findAll({
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
            couponData:couponData??[],
            // isWishList:wishlists?true:false
            isWishList:wishlists ? true:false
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
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.getPublicDiseases = async (req, res) => {
  try {
    const diseasesData = await Diseases.findAll({
      where: {
        status: true,
      },
      raw: true,
    });

    if (diseasesData.length > 0) {
      return Helper.response(
        true,
        "Data found Successfully",
        diseasesData,
        res,
        200
      );
    } else {
      return Helper.response(false, "No data Found", [], res, 200);
    }
  } catch (error) {
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.getPublicDoctor = async (req, res) => {
  try {
    const doctorData = await Doctor.findAll({
      where: {
        status: true,
      },
      raw: true,
    });

    if (doctorData.length > 0) {
      return Helper.response(
        true,
        "Data found Successfully",
        doctorData,
        res,
        200
      );
    } else {
      return Helper.response(false, "No data Found", [], res, 200);
    }
  } catch (error) {
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.bookConsultancy = async (req, res) => {
  try {
    const {
      mobile,
      name,
      email,
      age,
      gender,
      consult_purpose,
      details,
      previous_disease,
      image,
      booking_date,
      booking_time,
    } = req.body;

    if (!mobile || !name || !email) {
      return Helper.response(false, "All Fields Required!", {}, res, 401);
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return Helper.response(false, "No files uploaded", null, res, 400);
    }

    const createdDocs = [];

    for (const file of req.files) {
      const newDoc = await Consultancy.create({
        mobile: mobile.trim(),
        name: name.trim(),
        email: email.trim(),
        age: age.trim(),
        gender: gender.trim(),
        consult_purpose: consult_purpose.trim(),
        details: details.trim() ?? null,
        previous_disease: previous_disease.trim() ?? null,
        status: true,
        doc_type: file.mimetype,
        image: file.filename,
        booking_time: booking_time,
        booking_date: booking_date,
      });
      createdDocs.push(newDoc);
    }

    return Helper.response(
      true,
      "Consultancy added successfully",
      createdDocs,
      res,
      200
    );
  } catch (error) {
    console.log(error, "error:");
    return Helper.response(false, error?.message, {}, res, 200);
  }
};



exports.PubliclistVideos = async (req, res) => {
  try {
    const videos = await video.findAll({
      order: [["order", "ASC"]],
      raw: true,
    });
    
    const finalData = await Promise.all(
      videos.map(async (item) => {
        return {
            ...item,
        category: await Category.findOne({
            where: { id: item?.category_id },
            raw: true,
            attributes: [
                [
                    col("id"), "value"],
                [col("name"), "label"],
            ],
        })

        };
      }
    )
);

   

    
    return Helper.response(true, "Data found Successfully", finalData, res, 200);
  } catch (error) {
    console.error(error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};



exports.PublicBlog = async (req, res) => {
  try {
    const blogs = await blog.findAll({
      where: {
        status: true,
      },
      attributes: [
        "id",
        "blog_title",
        "category",
        "doctor",
        "extra_blog_details",
        "blog_img",
        "doc_type",
        "blog_img",
        "publish",
        "status",
        "createdAt",
      ],
      order: [["id", "desc"]],
      raw: true,
    });

    if (blogs.length > 0) {
         const data = await Promise.all(
        blogs.map(async (blog) => {
          const doctorData = await Doctor.findOne({
            where: { id: blog.doctor },
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
              [col("profileImage"), "dr_image"],
            ],
            raw: true,
          });
          const qualificationData = await Qualification.findAll({
            where: { doctorId: blog.doctor },
            attributes: [
            "degree",
            ],
            raw: true,
          });
          const categoryData = await Category.findOne({
            where: { id: blog.category },
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
            raw: true,
          });
          return {
            ...blog,
            doctor: doctorData || {},
            category: categoryData || {},
            qualification:[(qualificationData || []).map(item => item.degree).join(',')],
           date: blog.createdAt ? Helper.newDateFormat(blog.createdAt) : null,
          };
        })
      );

      return Helper.response(true, "Data found Successfully", data, res, 200);
    } else {
      return Helper.response(false, "No data found", null, res, 200);
    }
  } catch (error) {
    console.error("Error creating menu:", error);
    return Helper.response(false, error?.errors?.[0].message, {}, res, 200);
  }
};


exports.getProductById = async (req, res) => {
  try {
    let { id,slug,categories, diseases, ingredients, prince_range } = req.body;
    let whereCondition = {};
    // handle disease filter
    if(!slug){
      return Helper.response(false,"slug Is Required",{},res,200)
    }
    if(id){
      whereCondition.id=id;
    }
    if(slug){
      whereCondition.slug=slug;
    }
    if (diseases && diseases.length > 0) {
      const diseaseConditions = diseases.map((d) => ({
        disease_id: {
          [Op.or]: [
            { [Op.eq]: String(d) },
            { [Op.like]: `${String(d)},%` },
            { [Op.like]: `%,${String(d)},%` },
            { [Op.like]: `%,${String(d)}` },
          ],
        },
      }));

      if (!whereCondition[Op.or]) whereCondition[Op.or] = [];
      whereCondition[Op.or].push(...diseaseConditions);
    }

    // handle ingredient filter
    if (ingredients && ingredients.length > 0) {
      const ingredientConditions = ingredients.map((i) => ({
        ingredient_id: {
          [Op.or]: [
            { [Op.eq]: String(i) },
            { [Op.like]: `${String(i)},%` },
            { [Op.like]: `%,${String(i)},%` },
            { [Op.like]: `%,${String(i)}` },
          ],
        },
      }));

      if (!whereCondition[Op.or]) whereCondition[Op.or] = [];
      whereCondition[Op.or].push(...ingredientConditions);
    }

    // handle category filter
    if (categories && categories.length > 0) {
      whereCondition.category_id = { [Op.in]: categories };
    }
    if (prince_range && prince_range.length > 0) {
      whereCondition.mrp = { [Op.between]: prince_range };
    }

    const bannerData = await Product.findAll({
      order: [["id", "desc"]],
      raw: true,
    });
    if (bannerData.length == 0) {
      return Helper.response(false, "No Data Found", {}, res, 200);
    }
    const products = await Product.findAll({
      where: whereCondition,
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
          ingredient: await ingredient.findAll({
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
    return Helper.response(false, error?.message, {}, res, 500);
  }
};