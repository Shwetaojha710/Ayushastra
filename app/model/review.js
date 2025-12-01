const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

 const Review = sequelize.define('review', {
    id: {
      type: DataTypes.INTEGER,
       primaryKey: true,
         autoIncrement: true,
    },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    comments: {type:DataTypes.TEXT, allowNull: true },
    rating: { type: DataTypes.SMALLINT, allowNull: false },
    verifiedPurchase: { type: DataTypes.BOOLEAN, defaultValue: false },
    pros: DataTypes.TEXT,
    cons: DataTypes.TEXT,
    helpfulCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    reportedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' }

  }, {
    tableName: 'reviews',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });



// Review.sync({ alter: true }).then(() => {
//     console.log("Review model synced successfully");
// }).catch((error) => {
//     console.error("Error syncing Review model:", error);
// });

module.exports = Review;
