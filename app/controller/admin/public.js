const banner = require("../../model/banner");
const blog = require("../../model/blog");
const Brand = require("../../model/brand");
const Category = require("../../model/category");
const Consultancy = require("../../model/consultancy");
const Diseases = require("../../model/diseases");
const Doctor = require("../../model/doctor");
const ingredient = require("../../model/ingredient");
const Product = require("../../model/product");
const product_gallery = require("../../model/product_gallery");
const ProductType = require("../../model/product_type");
const Qualification = require("../../model/qualification");
const Unit = require("../../model/unit");
const video = require("../../model/video");
const Coupon = require("../../model/coupon");
const Helper = require("../../helper/helper");
const { Op, col } = require("sequelize");
const wishlist = require("../../model/wishlist");
const registered_user = require("../../model/registeredusers");
const Review = require("../../model/review");
const OrderItem = require("../../model/orderItem");
const ReviewGallery = require("../../model/review_gallery");
const path = require("path");
const sequelize = require("../../connection/connection");
const pin_code_master = require("../../model/pin_code_master");
const Cart = require("../../model/cart");
const speclization = require("../../model/specilization");

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
    let { categories, diseases, ingredients, price_range, search } = req.body;

    const deviceId = req?.headers?.deviceid;
    const token = req.headers["authorization"]?.split(" ")[1];
    const registerUser = token
      ? await registered_user.findOne({ where: { token, isDeleted: false } })
      : null;

    let whereCondition = { status: true, isPublish: true };
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
    if (price_range && price_range.length > 0) {
      whereCondition.offer_price = { [Op.between]: price_range };
    }

    const bannerData = await Product.findAll({
      order: [["id", "desc"]],
      raw: true,
      where: {
        status: true,
        isPublish: true,
      },
    });
    if (bannerData.length == 0) {
      return Helper.response(false, "No Data Found", {}, res, 200);
    }
    const products = await Product.findAll({
      where: whereCondition,
      order: [["id", "ASC"]],
      raw: true,
    });

    if (products.length == 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }

    const finalData = await Promise.all(
      products.map(async (item) => {
        const couponData = item.id
          ? await Coupon.findAll({
              where: {
                product_id: item?.id,
                status: true,
              },
              raw: true,
              order: [["id", "ASC"]],
            })
          : [];

        const ProductGallery = await product_gallery.findAll({
          where: { productId: item.id },
          raw: true,
          order: [["id", "ASC"]],
          status: true,
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
        const wishlists = registerUser
          ? await wishlist.findOne({
              where: {
                productId: item.id,
                registeruserId: registerUser?.id,
              },
            })
          : null;

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
          couponData: couponData ?? [],
          // isWishList:wishlists?true:false
          isWishList: wishlists ? true : false,
          wishlistId: wishlists ? wishlists?.id : 0,
        };
      })
    );

    if (search) {
      const searchedData = Helper.filterProducts(finalData, search);
      if (searchedData.length == 0) {
        return Helper.response(false, "No Data Found", [], res, 200);
      }
      return Helper.response(
        true,
        "Data Found Successfully",
        searchedData,
        res,
        200
      );
    }

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
       const qualification=await Qualification.findAll({
          raw:true,
          order:[["id","desc"]],
          attributes:["doctorId"]
         })
         let DoctorId=qualification.map((item)=>item.doctorId)
        const doctorData = await Doctor.findAll({
          raw: true,
          order: [["id", "desc"]],
          where:{
            id:{
              [Op.in]:DoctorId
            },
            KYCstatus:"approved",
          }
        });
    // const doctorData = await Doctor.findAll({
    //   where: {
    //     status: true,
    //   },
    //   raw: true,
    // });

    // const finalData=await Promise.all(
    //    doctorData.map(async(item)=>{
    //     const Specilizationdata=await speclization.findAll({
    //       where:{
    //         id:item?.speciality   
    //       }
    //     })
    //       return  {
    //          ...item,
    //          speclization:Specilizationdata
    //       }
    //    })
    // )

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
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),
        };
      })
    );

    return Helper.response(
      true,
      "Data found Successfully",
      finalData,
      res,
      200
    );
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
            attributes: ["degree"],
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
            qualification: [
              (qualificationData || []).map((item) => item.degree).join(","),
            ],
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
    let { id, slug, categories, diseases, ingredients, prince_range } =
      req.body;

    // if (!slug) {
    //   return Helper.response(false, "slug is required", {}, res, 400);
    // }

    let whereCondition = {};

    // ID filter
    if (id) whereCondition.id = id;

    if (slug) {
      // SLUG filter
      whereCondition.slug = slug;
    }

    // CATEGORY filter
    if (categories && categories.length > 0) {
      whereCondition.category_id = { [Op.in]: categories };
    }

    // PRICE RANGE
    if (prince_range && prince_range.length == 2) {
      whereCondition.mrp = { [Op.between]: prince_range };
    }

    // ---------------------------------------
    // DISEASE & INGREDIENT FILTER HANDLING
    // ---------------------------------------

    let orConditions = [];

    // DISEASE filter
    if (diseases?.length > 0) {
      diseases.forEach((d) => {
        d = String(d);
        orConditions.push({
          disease_id: {
            [Op.or]: [
              { [Op.eq]: d },
              { [Op.like]: `${d},%` },
              { [Op.like]: `%,${d},%` },
              { [Op.like]: `%,${d}` },
            ],
          },
        });
      });
    }
    // INGREDIENT filter
    if (ingredients?.length > 0) {
      ingredients.forEach((i) => {
        i = String(i);
        orConditions.push({
          ingredient_id: {
            [Op.or]: [
              { [Op.eq]: i },
              { [Op.like]: `${i},%` },
              { [Op.like]: `%,${i},%` },
              { [Op.like]: `%,${i}` },
            ],
          },
        });
      });
    }

    if (orConditions.length > 0) {
      whereCondition[Op.or] = orConditions;
    }

    // ---------------------------------------
    // FETCH PRODUCTS
    // ---------------------------------------
    const products = await Product.findAll({
      where: whereCondition,
      order: [["id", "ASC"]],
      raw: true,
    });

    if (products.length === 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }

    // ---------------------------------------
    // FINAL DATA ENRICHMENT
    // ---------------------------------------
    const finalData = await Promise.all(
      products.map(async (item) => {
        // PRODUCT GALLERY
        const ProductGallery = await product_gallery.findAll({
          where: { productId: item.id },
          order: [["id", "ASC"]],
          raw: true,
        });

        // INGREDIENT IDS
        const ingredientIds = item.ingredient_id
          ? item.ingredient_id.split(",").map(Number).filter(Boolean)
          : [];

        // DISEASE IDS
        const diseaseIds = item.disease_id
          ? item.disease_id.split(",").map(Number).filter(Boolean)
          : [];

        // ORDER ITEMS → ORDER IDs
        const orderItems = await OrderItem.findAll({
          where: { product_id: item.id },
          raw: true,
        });

        const order_ids = orderItems.map((o) => o.order_id);

        // PRODUCT REVIEWS
        let reviews = order_ids.length
          ? await Review.findAll({
              where: { order_id: { [Op.in]: order_ids } },
              raw: true,
            })
          : [];

        reviews = reviews.length>0 ? await Promise.all(
          reviews.map(async (item) => {
            const user = item?.userId
              ? await registered_user.findOne({
                  where: { id: item.userId },
                  raw: true,
                }): null;
            const gallery = await ReviewGallery.findAll({
              where: {
                review_id: item?.id,
              },

              raw: true,
            });
            return {
              ...item,
              name: user ? `${user.first_name} ${user.last_name}` : null,
              profile_image: user ? `${user.profile_image}` : null,
              review_gallery: gallery ? gallery : [],
            };
          })
        ):null;
        const token = req.headers["authorization"]?.split(" ")[1];
        const registerUser = token
          ? await registered_user.findOne({
              where: { token, isDeleted: false },
            })
          : null;
        const cartData = registerUser ?  await Cart.findOne({
          where: {
            registeruserId: registerUser?.id,
            productId: item?.id,
          },
        }):null;
        return {
          ...item,
          product_gallery: ProductGallery,
          disease: await Diseases.findAll({
            where: { id: { [Op.in]: diseaseIds } },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),

          ingredient: await ingredient.findAll({
            where: { id: { [Op.in]: ingredientIds } },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),

          category: await Category.findOne({
            where: { id: item.category_id },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),

          brand: await Brand.findOne({
            where: { id: item.brand_id },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),

          product_types: await ProductType.findOne({
            where: { id: item.product_type },
            raw: true,
            attributes: [
              [col("id"), "value"],
              [col("name"), "label"],
            ],
          }),

          unit_data: item.unit
            ? await Unit.findOne({
                where: { id: item.unit },
                raw: true,
                attributes: [
                  [col("id"), "value"],
                  [col("name"), "label"],
                ],
              })
            : null,
          isCartAdded: cartData ? true : false,
          cartQuatity: cartData ? cartData?.quantity : 0,
          reviews: reviews,
        };
      })
    );

    // EXTRACT DISEASE & INGREDIENT IDs FROM MAIN PRODUCT
    const targetDiseaseIds = finalData[0].disease?.map((d) => d.value) || [];
    const targetIngredientIds = finalData[0].ingredient?.map((i) => i.value) || [];

    // RELATED PRODUCT QUERY CONDITIONS
    let relatedOR = [];

    // match diseases
    targetDiseaseIds.forEach((d) => {
      relatedOR.push({
        disease_id: {
          [Op.or]: [
            { [Op.eq]: String(d) },
            { [Op.like]: `${d},%` },
            { [Op.like]: `%,${d},%` },
            { [Op.like]: `%,${d}` },
          ],
        },
      });
    });

    // match ingredients
    targetIngredientIds.forEach((i) => {
      relatedOR.push({
        ingredient_id: {
          [Op.or]: [
            { [Op.eq]: String(i) },
            { [Op.like]: `${i},%` },
            { [Op.like]: `%,${i},%` },
            { [Op.like]: `%,${i}` },
          ],
        },
      });
    });

    // FETCH RELATED PRODUCTS
    let relatedProducts = [];
    if (relatedOR.length > 0) {
      relatedProducts = await Product.findAll({
        where: {
          id: { [Op.ne]: finalData[0].id }, // exclude current product
          [Op.or]: relatedOR,
            status: true,
        isPublish: true,
        },
      
        limit: 10,
        order: [["id", "DESC"]],
        raw: true,
      });
    }

    // ATTACH RELATED PRODUCTS
    finalData[0].related_products = relatedProducts;

    return Helper.response(
      true,
      "Data Found Successfully",
      finalData,
      res,
      200
    );
  } catch (error) {
    console.log(error,"errror fetching product by id");
    
    return Helper.response(false, error.message, {}, res, 500);
  }
};

const calculateAge = (dob) => {
  const birth = new Date(dob);
  const diff = Date.now() - birth.getTime();
  return new Date(diff).getUTCFullYear() - 1970;
};

exports.addPublicDoctor = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const body = req.body;
    const files = req.files;

    // Required field validation
    if (!body.name || !body.email || !body.gender || !body.dob) {
      await t.rollback();
      return Helper.response(false, "Missing required fields.", {}, res, 400);
    }

    // Calculate duration between start–end time
    const start = new Date(`1970-01-01T${body?.start_time}:00`);
    const end = new Date(`1970-01-01T${body?.end_time}:00`);
    const diffMs = end - start;
    const duration = Math.floor(diffMs / 60000);
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
    // Build Doctor object
    const doctorData = {
      loginId: 1,
      name: body.name,
      experience: body.experience,
      email: body.email,
      gender: body.gender,
      dob: new Date(body.dob),
      age: calculateAge(body.dob),
      // refferalCode: body.referral_code,
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
      password: "123456",
      status: true,
      availability: body?.availability,
      end_time: body?.end_time,
      start_time: body?.start_time,
      online_consultation_fees: body?.online_consultation_fees,
      duration,
      profileImage: files.profile_img
        ? path.basename(files.profile_img[0].path)
        : null,
      panNo: files.pan_img ? path.basename(files.pan_img[0].path) : null,
      addharFrontImage: files.aadhaar_f_img
        ? path.basename(files.aadhaar_f_img[0].path)
        : null,
      addharBackImage: files.aadhaar_b_img
        ? path.basename(files.aadhaar_b_img[0].path)
        : null,
      cert_image: files.cert_img ? path.basename(files.cert_img[0].path) : null,
      known_language: body.known_language,
      refferalCode: referral_code,
      refferedBy: body.refferedBy,
    };

    const doctor = await Doctor.create(doctorData, { transaction: t });

    const qualifications = [];
    let index = 0;

    while (body[`qualifications[${index}].degree`]) {
      const certFile = files[`qualifications[${index}].certificate`]
        ? path.basename(files[`qualifications[${index}].certificate`][0].path)
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

    if (qualifications.length > 0) {
      await Qualification.bulkCreate(qualifications, { transaction: t });
    }

    await t.commit();

    return Helper.response(
      true,
      "Doctor added successfully",
      { doctor, qualifications },
      res,
      200
    );
  } catch (error) {
    console.error("Error adding doctor:", error);
    await t.rollback();
    return Helper.response(
      false,
      error?.errors?.[0]?.message || "Internal Server Error",
      {},
      res,
      500
    );
  }
};

exports.referralDetails = async (req, res) => {
  try {
    const { referral_code } = req.body;
    if (!referral_code) {
      return Helper.response(false, "Referral Code is Required", [], res, 400);
    }

    const data = await Doctor.findOne({
      where: {
        refferalCode: referral_code,
      },
      attributes: ["id", "name"],
      raw: true,
    });

    if (!data) {
      return Helper.response(false, "No Doctor Present", [], res, 200);
    }

    return Helper.response(true, "Data Found Successfully", data, res, 200);
  } catch (error) {
    console.error("Error adding doctor:", error);
    return Helper.response(
      false,
      error?.errors?.[0]?.message || "Internal Server Error",
      {},
      res,
      500
    );
  }
};

exports.getStateDistrict = async (req, res) => {
  try {
    const { pin_code } = req.body;
    if (!pin_code) {
      return Helper.response(false, "Pin Code Is Required", {}, res, 400);
    }

    const data = await pin_code_master.findOne({
      where: {
        pin_code: pin_code,
      },
      attributes: ["id", "district_name", "state_name","district_id","state_id"],
      raw: true,
    });

    if (!data) {
      return Helper.response(false, "No District Present", [], res, 200);
    }

    return Helper.response(true, "Data Found Successfully", data, res, 200);
  } catch (error) {
    console.error("Error adding District:", error);
    return Helper.response(
      false,
      error?.errors?.[0]?.message || "Internal Server Error",
      {},
      res,
      500
    );
  }
};


exports.doctorStepDetails=async(req,res)=>{
  try {

    const {step}=req.body
    

    
  } catch (error) {
    console.error("Error adding District:", error);
    return Helper.response(
      false,
      error?.errors?.[0]?.message || "Internal Server Error",
      {},
      res,
      500
    );
  }
}