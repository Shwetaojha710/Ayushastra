const Category = require("../../model/category");
const Subcategory = require("../../model/subcategory");
const Helper = require("../../helper/helper.js");

exports.addsubcategory = async (req, res) => {
  try {
    const { name, status='active',category_id } = req.body;

    if (!name || !category_id) {
         return Helper.response(false, "Category Id and subcategory name is required", [], res, 400);
    }

    const subcategory = await Subcategory.create({ name,category_id, status });
    return Helper.response(true, "subcategory added successfully", subcategory, res, 201);
  } catch (error) {
    return Helper.response(false,error.message, "Error adding subcategory",  res, 500);

  }
};


exports.getAllSubCategories = async (req, res) => {
  try {
    const Subcategories = await Subcategory.findAll({
        order: [["createdAt", "DESC"]],
        raw: true,
        model: Category
    });
    if (Subcategories.length === 0) {
      return Helper.response(false, "No categories found", [], res, 404);
    }
    return Helper.response(true, "Subcategories fetched successfully", Subcategories, res, 200);
  } catch (error) {
    return Helper.response(false,error.message, "Error fetching Subcategories",  res, 500);
   
  }
};

exports.getsubcategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await Subcategory.findByPk(id);
    if (!subcategory) {
      return res.status(404).json({ success: false, message: "subcategory not found" });
    }

    res.status(200).json({ success: true, data: subcategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching subcategory", error: error.message });
  }
};

exports.updatesubcategory = async (req, res) => {
  try {

    const { id,name, status } = req.body;
    if(!id){
        return Helper.response(false, "subcategory ID is required", [], res, 400);
    }
    if (!name) {
         return Helper.response(false, "subcategory name is required", [], res, 400);
    }

    const subcategory = await Subcategory.findByPk(id);
    if (!subcategory) {
        return Helper.response(false, "subcategory not found", [], res, 404);

    }

    subcategory.name = name || subcategory.name;
    subcategory.status = status || subcategory.status;

    await subcategory.save();
    return Helper.response(true, "subcategory updated successfully", subcategory, res, 200);
  } catch (error) {
    return Helper.response(false,error.message, "Error updating subcategory",  res, 500);

  }
};


exports.deletesubcategory = async (req, res) => {
  try {
    const { id } = req.body;

    if(!id){
        return Helper.response(false, "subcategory ID is required", [], res, 400);
    }
    const subcategory = await Subcategory.findByPk(id);
    if (!subcategory) {
        return Helper.response(false, "subcategory not found", [], res, 404);
    }

    await Subcategory.destroy();
    return Helper.response(true, "subcategory deleted successfully", [], res, 200);
  } catch (error) {
    return Helper.response(false,error.message, "Error deleting subcategory",  res, 500);
  }
};
