const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const Category = require("./category");

const Product = sequelize.define(
  "product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stock_alert: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hold_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    minimum_qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    maximum_qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_varitions: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    mrp: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    offer_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    gst: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    ayu_cash: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    sku: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    hsn: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Foreign Keys
    disease_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ingredient_id: {
      type:  DataTypes.STRING,
      allowNull: true,
    },
    category_id: {
      type:  DataTypes.INTEGER,
      allowNull: true,
    },
    brand_id: {
      type:  DataTypes.INTEGER,
      allowNull: true,
    },
    tax_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    product_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    total_products: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    manufacture_date: {
      type: DataTypes.DATEONLY,
      allowNull:false
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
    allowNull:false
    },
    meta_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    product_meta_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    product_banner_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    short_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    long_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    extra_product_details: {
      type: DataTypes.TEXT,
      defaultValue: true,
    },
    isPublish: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isFragile: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    unit: {
      type: DataTypes.INTEGER,
      allowNull:true,
    },
    discount_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    final_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull:true
    },
  },
  {
    tableName: "product",
    timestamps: true,
  }
);
Product.belongsTo(Category, { foreignKey: "category_id" });
// Product.sync({alter:true})
//   .then(() => {
//     console.log("Product model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing Product model:", error);
//   });

module.exports = Product;
