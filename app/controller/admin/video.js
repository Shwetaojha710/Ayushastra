const Category = require("../../model/category");
const Video = require("../../model/video");
const Helper = require("../../helper/helper");
const { col } = require("sequelize");
const fs = require("fs");
const path = require("path");
// exports.addVideo = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       url,
//       order,
//       image,
//       image_alt,
//       status,
//       img_type,
//       size,
//       category_id,
//     } = req.body;

//     if (!title || !url) {
//         return Helper.response(false, "Title and URL are required.", {}, res, 400);
//     }

//     const video = await Video.create({
//       title,
//       description,
//       url,
//       category_id,
//       order,
//       image,
//       image_alt,
//       status,
//       img_type,
//       size,
//       created_by:req.users?.id,
//     });

//     return Helper.response(true, "Video added successfully", {}, res, 200);
//   } catch (error) {
//     console.error(error);
//     return Helper.response(false, error?.message, {}, res, 500);
//   }
// };

exports.addVideo = async (req, res) => {
  const {
    title,
    description,
    url,
    order,
    image,
    image_alt,
    status = true,
    img_type,
    size,
    category_id,
  } = req.body;
  try {
    if (!title || !url) {
      return Helper.response(
        false,
        "Title and URL are required.",
        {},
        res,
        400
      );
    }
    // const existingBlog = await blog.findOne({
    //   where: { blog_title, category, doctor, extra_blog_details, publish },
    // });
    // if (existingBlog) {
    //   Helper.deleteUploadedFiles(req.files);
    //   return Helper.response(false, "Category already exists.", [], res, 400);
    // }

    if (!req.files || Object.keys(req.files).length === 0) {
      return Helper.response(false, "No files uploaded", null, res, 400);
    }

    const createdDocs = [];

    for (const file of req.files) {
      const video = await Video.create({
        description,
        url,
        order,
        title,
        image: file.filename,
        image_alt,
        status,
        img_type,
        size,
        category_id,
        doc_type: file.mimetype,
        createdBy: req.users?.id,
        updatedBy: req.users?.id,
        status: status || true,
      });
      createdDocs.push(video);
    }

    return Helper.response(
      true,
      "Video added successfully",
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

exports.listVideos = async (req, res) => {
  try {
    const videos = await Video.findAll({
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

exports.updateVideo = async (req, res) => {
  const { id } = req.body;
  const {
    title,
    description,
    url,
    order,
    image_alt,
    status,
    img_type,
    size,
    category_id,
  } = req.body;

  try {
    // Find existing record
    const video = await Video.findByPk(id);
    if (!video) {
      return Helper.response(false, "Video not found", {}, res, 404);
    }

    let newImage = video.image;

    if (req.files && Object.keys(req.files).length > 0) {
      const file = req.files[0];
      newImage = file.filename || file.originalFilename;

      if (video.image) {
        const oldImagePath = path.join(__dirname, "../uploads", video.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    await video.update({
      title,
      description,
      url,
      order,
      image: newImage,
      image_alt,
      status,
      img_type,
      size,
      category_id,
      updated_by: req.users?.id || null,
    });

    return Helper.response(true, "Video updated successfully", video, res, 200);
  } catch (error) {
    console.error("Error updating video:", error);
    if (req.files) Helper.deleteUploadedFiles(req.files);
    return Helper.response(false, error?.message, null, res, 500);
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.body;
    const video = await Video.findByPk(id);

    if (!video) return Helper.response(false, "Id is Required", {}, res, 404);

    await video.destroy();
    return Helper.response(true, "Deleted Successfully", [], res, 200);
  } catch (error) {
    console.error(error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};
