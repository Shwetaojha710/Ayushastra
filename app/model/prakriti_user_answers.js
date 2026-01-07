const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const PrakritiUserAnswer = sequelize.define(
  "prakriti_user_answers",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    test_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "FK → prakriti_tests.id",
    },

    question_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "FK → prakriti_question.id",
    },

    option_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "FK → prakritiOption.id",
    },

    dosha: {
      type: DataTypes.ENUM("V", "P", "K"),
      allowNull: false,
    },

    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "prakriti_user_answers",
    timestamps: true,
    underscored: true,
  }
);

//   PrakritiUserAnswer.sync({alter:true})
//   .then(() => {
//     console.log("PrakritiUserAnswer model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing PrakritiUserAnswer model:", error);
//   });

module.exports = PrakritiUserAnswer;
