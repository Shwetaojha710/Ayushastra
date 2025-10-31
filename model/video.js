const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");
const video = sequelize.define("video", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category_id:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  title:{
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description:{
    type: DataTypes.TEXT,
    allowNull: true,
  },
  url:{
    type: DataTypes.TEXT,
    allowNull: true,
  },

  order:{
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    field: "image",
    allowNull: true,
  },
  image_alt: {
    type: DataTypes.STRING,
    field: "image_alt",
    allowNull: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  img_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  size: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  updated_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },

}, {
    tableName: 'video',
    timestamps: true
});

// video.sync({alter:true}).then(() => {
//     console.log('video model synced successfully');
// }).catch((error) => {
//     console.error('Error syncing video model:', error);
// });


module.exports = video;
