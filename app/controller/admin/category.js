const Category = require("../../model/category");
const Helper = require("../../helper/helper.js");
const {col}=require('sequelize')
// exports.addCategory = async (req, res) => {
//   try {
//     const { name, status } = req.body;
//       console.log(req.users,"req usersss");

//     if (!name) {
//          return Helper.response(false, "Category name is required", [], res, 400);
//     }

//     const existingCategory = await Category.findOne({ where: { name } });
//     if (existingCategory) {
//         return Helper.response(false, "Category name already exists", [], res, 409);
//     }
//     const category = await Category.create({ name, status, createdBy: req.users?.id || 1 });
//     return Helper.response(true, "Category added successfully", category, res, 201);
//   } catch (error) {
//     return Helper.response(false,error.message, "Error adding category",  res, 500);

//   }
// };

exports.addCategory = async (req, res) => {
  const { name, status, parent_id, order } = req.body;
  try {
    if (!name) {
      return Helper.response(false, "Category name is required", [], res, 400);
    }
    const existingCategory = await Category.findOne({
      where: { name: name.trim() },
    });
    if (existingCategory) {
      Helper.deleteUploadedFiles(req.files);
      return Helper.response(false, "Category already exists.", [], res, 400);
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return Helper.response(false, "No files uploaded", null, res, 400);
    }

    const createdDocs = [];
    if (!parent_id) {
      // **Check If Menu Already Exists**
      const existingCategory = await Category.count({
        where: { name: name.trim() },
      });
      if (existingCategory) {
        return Helper.response(
          false,
          "Category Already Exists",
          null,
          res,
          200
        );
      }
    }

    for (const file of req.files) {
      const newDoc = await Category.create({
        name: name.trim(),
        parent_id: parent_id || 0,
        status,
        order: order || 0,
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
      "Category added successfully",
      createdDocs,
      res,
      200
    );
  } catch (error) {
    console.error("Error adding Category:", error);
    Helper.deleteUploadedFiles(req.files);
    return Helper.response(false, error?.message, null, res, 500);
  }
};

// exports.getAllCategories = async (req, res) => {
//   try {
//     const categories = await Category.findAll({

//         raw: true
//     });
//     if (categories.length === 0) {
//       return Helper.response(false, "No categories found", [], res, 404);
//     }
//     return Helper.response(true, "Categories fetched successfully", categories, res, 200);
//   } catch (error) {
//     return Helper.response(false,error.message, "Error fetching categories",  res, 500);

//   }
// };

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: {
        status: true,
      },
      attributes: [
        "id",
        "parent_id",
        "name",
        "doc_type",
        "image",
        "status",
        "order",
      ],
      order: [["order", "ASC"]],
      raw: true,
    });


    if (categories.length > 0) {
    
      const map = {};
      categories.forEach((item) => {
        map[item.id] = { ...item, subcategory: [] };
      });

 
      let tree = [];
      categories.forEach((item) => {
        if (item.parent_id !== 0) {
          map[item.parent_id]?.subcategory.push(map[item.id]);
        } else {
          tree.push(map[item.id]);
        }
      });
      tree = tree.map((item) => {
        if (Array.isArray(item.subcategory) && item.subcategory.length === 0) {
          delete item.subcategory;
        }
        return item;
      });

      return Helper.response(true, "data found Successfully", tree, res, 200);
    } else {
      return Helper.response(false, "No data found", null, res, 200);
    }
  } catch (error) {
    console.error("Error creating menu:", error);
    return Helper.response(false, error?.errors?.[0].message, {}, res, 200);
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching category",
        error: error.message,
      });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id, name, status, parent_id, order } = req.body;

    if (!id) {
      return Helper.response(false, "Category ID is required", [], res, 400);
    }
    // if (!name) {
    //   return Helper.response(false, "Category name is required", [], res, 400);
    // }

    const category = await Category.findByPk(id);
    if (!category) {
      return Helper.response(false, "Category not found", [], res, 404);
    }

    if (req.files && req.files.length > 0) {
      if (category.image) {
        Helper.deleteFile(category.image);
      }

      const file = req.files[0];
      category.image = file.filename;
      category.doc_type = file.mimetype;
    }

    category.name =name ? name?.trim() : category.name;
    category.parent_id = parent_id || category.parent_id;
    category.status = status || category.status;
    category.order = order || category.order;
    category.updatedBy = req.users?.id || 1;

    await category.save();

    return Helper.response(
      true,
      "Category updated successfully",
      category,
      res,
      200
    );
  } catch (error) {
    console.error("Error updating Category:", error);
    Helper.deleteUploadedFiles(req.files);
    return Helper.response(false, error.message, null, res, 500);
  }
};

// exports.updateCategory = async (req, res) => {
//   try {

//     const { id,name, status } = req.body;
//     if(!id){
//         return Helper.response(false, "Category ID is required", [], res, 400);
//     }
//     if (!name) {
//          return Helper.response(false, "Category name is required", [], res, 400);
//     }

//     const category = await Category.findByPk(id);
//     if (!category) {
//         return Helper.response(false, "Category not found", [], res, 404);

//     }

//     category.name = name || category.name;
//     category.status = status ;
//     category.updatedBy = req.users?.id || 1;

//     await category.save();
//     return Helper.response(true, "Category updated successfully", category, res, 200);
//   } catch (error) {
//     return Helper.response(false,error.message, "Error updating category",  res, 500);

//   }
// };

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return Helper.response(false, "Category ID is required", [], res, 400);
    }
    const category = await Category.findByPk(id);
    if (!category) {
      return Helper.response(false, "Category not found", [], res, 404);
    }

    await category.destroy();
    return Helper.response(true, "Category deleted successfully", [], res, 200);
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error deleting category",
      res,
      500
    );
  }
};

// exports.getcategoryDD = async (req, res) => {
//   try {
//     const categories = await Category.findAll({
//       where: {
//         status: true,
//       },
//       attributes: [
//         [col("id"), "value"],
//         [col("name"), "label"],
//         "order",
//         "image"
//       ],
//       order: [["order", "ASC"]],
//       raw: true,
//     });
//     if (categories.length > 0) {
//       return Helper.response(
//         true,
//         "Data Found Successfully",
//         categories,
//         res,
//         200
//       );
//     } else {
//       return Helper.response(true, "No Data Found", [], res, 200);
//     }
//   } catch (error) {
//     console.log(error);

//     return Helper.response(
//       false,
//       error.message,
//       "Error Getting Category",
//       res,
//       500
//     );
//   }
// };

exports.getcategoryDD = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { status: true },
      attributes: ["id", "parent_id", "name", "doc_type", "image", "status", "order"],
      order: [["order", "ASC"]],
      raw: true,
    });

    if (categories.length === 0) {
      return Helper.response(false, "No data found", null, res, 200);
    }

    const map = {};
    categories.forEach((item) => {
      map[item.id] = { ...item, children: [] };
    });

    const tree = [];
    categories.forEach((item) => {
      if (item.parent_id && item.parent_id !== 0 && map[item.parent_id]) {
        map[item.parent_id].children.push(map[item.id]);
      } else {
        tree.push(map[item.id]);
      }
    });

    const formatToValueLabel = (nodes) => {
      return nodes.map((node) => {
        const formattedNode = {
          label: node.name,
          value: node.id
        };

        // Recursively map children if they exist
        if (node.children && node.children.length > 0) {
          formattedNode.children = formatToValueLabel(node.children);
        }

        return formattedNode;
      });
    };
 
    
    const formattedTree = formatToValueLabel(tree);

    return Helper.response(true, "Data found successfully", formattedTree, res, 200);
  } catch (error) {
    console.error("Error creating category dropdown:", error);
    return Helper.response(false, error?.message || "Something went wrong", {}, res, 500);
  }
};


