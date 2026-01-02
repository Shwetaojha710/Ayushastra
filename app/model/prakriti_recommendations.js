const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const PrakritiRecommendation = sequelize.define(
  "prakriti_recommendations",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    prakriti_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment:
        "VATA / PITTA / KAPHA / VATA-PITTA / PITTA-KAPHA / VATA-KAPHA / TRIDOSHA",
    },

    section: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "AAHAR / VIHAR / CHIKITSA",
    },

    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Prefer / Avoid / Recommended",
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prefer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avoid: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue:true
    },
  },
  {
    tableName: "prakriti_recommendations",
    timestamps: false, // no createdAt / updatedAt in SQL
  }
);

// PrakritiRecommendation.sync({ alter: true })
//   .then(() => console.log("PrakritiRecommendation synced"))
//   .catch(console.error);
module.exports = PrakritiRecommendation;
