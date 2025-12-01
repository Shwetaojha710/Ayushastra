const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const banner = sequelize.define("banners", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  image_title:{
    type: DataTypes.TEXT,
    allowNull: true,
  },
 meta_tags:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  image_alt:{
    type: DataTypes.TEXT,
    allowNull: true,
  },
  order:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  banner_image: {
    type: DataTypes.STRING,
    field: "banner_image",
    allowNull: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  
  doc_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

});

// banner.sync({alter:true}).then(() => {
//     console.log('banner model synced successfully');
// }).catch((error) => {
//     console.error('Error syncing banner model:', error);
// });
module.exports=banner