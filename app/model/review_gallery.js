const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const ReviewGallery = sequelize.define('review_gallery', {
    id: { type: DataTypes.INTEGER, primaryKey: true  ,  autoIncrement: true,},
    reviewId: { type: DataTypes.INTEGER, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false },
    doc_type: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: 'review_gallery',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });




// ReviewGallery.sync({ alter: true }).then(() => {
//     console.log("ReviewGallery model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing ReviewGallery model:", error);
// });

module.exports = ReviewGallery;
