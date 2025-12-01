const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const blog = sequelize.define("blog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  blog_title:{
    type: DataTypes.TEXT,
    allowNull: true,
  },
 category:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  doctor:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  extra_blog_details:{
    type: DataTypes.TEXT,
    allowNull: true,
  },
  blog_img: {
    type: DataTypes.STRING,
    field: "blog_img",
    allowNull: true,
  },
  publish: {
    type: DataTypes.BOOLEAN,
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

// blog.sync({alter:true}).then(() => {
//     console.log('blog model synced successfully');
// }).catch((error) => {
//     console.error('Error syncing blog model:', error);
// });
module.exports=blog