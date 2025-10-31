const blog = require("../../../model/blog.js");
const Category = require("../../../model/category.js");
const Doctor = require("../../../model/doctor.js");
const Qualification = require("../../../model/qualification.js");
const Helper = require("../../helper/helper.js");
const { col } = require("sequelize");

exports.addBlog = async (req, res) => {
  const {
    blog_title,
    category,
    doctor,
    extra_blog_details,
    publish,
    status = true,
  } = req.body;
  try {
    if (
      !blog_title ||
      blog_title.trim() === "" ||
      !category ||
      category.trim() === "" ||
      !doctor ||
      doctor.trim() === ""
    ) {
      return Helper.response(false, "Category name is required", [], res, 400);
    }
    const existingBlog = await blog.findOne({
      where: { blog_title, category, doctor, extra_blog_details, publish },
    });
    if (existingBlog) {
      Helper.deleteUploadedFiles(req.files);
      return Helper.response(false, "Category already exists.", [], res, 400);
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return Helper.response(false, "No files uploaded", null, res, 400);
    }

    const createdDocs = [];

    for (const file of req.files) {
      const newDoc = await blog.create({
        blog_title,
        category,
        doctor,
        extra_blog_details,
        publish,
        doc_type: file.mimetype,
        blog_img: file.filename,
        createdBy: req.users?.id,
        updatedBy: req.users?.id,
        status: status || true,
      });
      createdDocs.push(newDoc);
    }

    return Helper.response(
      true,
      "blog added successfully",
      createdDocs,
      res,
      200
    );
  } catch (error) {
    console.error("Error adding blog:", error);
    Helper.deleteUploadedFiles(req.files);
    return Helper.response(false, error?.message, null, res, 500);
  }
};

exports.getAllBlog = async (req, res) => {
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

exports.updateBlog = async (req, res) => {
  try {
    const {
      blog_title,
      category,
      doctor,
      extra_blog_details,
      publish,
      status = true,
      id
    } = req.body;

    if (!id) {
      return Helper.response(false, "Blog ID is required", [], res, 400);
    }

    const blogs = await blog.findByPk(id);
    if (!blogs) {
      return Helper.response(false, "Blog not found", [], res, 404);
    }

    if (req.files && req.files.length > 0) {
      if (blogs.blog_img) {
        Helper.deleteFile(blogs.blog_img);
      }

      const file = req.files[0];
      blogs.blog_img = file.filename;
      blogs.doc_type = file.mimetype;
    }

    blogs.blog_title = blog_title? blog_title.trim(): blogs.blog_title;
    blogs.category = category || blogs.category;
    blogs.status = status;
    blogs.extra_blog_details = extra_blog_details || blogs.extra_blog_details;
    blogs.publish = publish ;
    blogs.doctor = doctor || blogs.doctor;
    blogs.updatedBy = req.users?.id || 1;

    await blogs.save();

    return Helper.response(
      true,
      "Blog Updated Successfully",
      category,
      res,
      200
    );
  } catch (error) {
    console.error("Error updating Blog:", error);
    Helper.deleteUploadedFiles(req.files);
    return Helper.response(false, error.message, null, res, 500);
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return Helper.response(false, "Blog ID is required", [], res, 400);
    }
    const category = await blog.findByPk(id);
    if (!category) {
      return Helper.response(false, "Blog not found", [], res, 404);
    }

    await category.destroy();
    return Helper.response(true, "Blog deleted successfully", [], res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error deleting Blog",
      res,
      500
    );
  }
};


