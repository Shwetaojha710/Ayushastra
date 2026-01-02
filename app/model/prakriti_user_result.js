const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const PrakritiUserResult = sequelize.define(
  "prakriti_user_result",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    v_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    p_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    k_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    prakriti_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment:
        "VATA / PITTA / KAPHA / VATA-PITTA / PITTA-KAPHA / VATA-KAPHA / TRIDOSHA",
    },

    // created_at: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
  },
 {
    tableName: 'prakriti_user_result',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

// PrakritiUserResult.sync({ alter: true })
//   .then(() => console.log("PrakritiUserResult synced"))
//   .catch(console.error);
  
module.exports = PrakritiUserResult;
