  const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const { duration } = require("moment/moment");
  

const ImmunityAnswer = sequelize.define('ImmunityAnswer', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    quiz_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    question_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    question_text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    selected_option: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'immunity_answers',
    underscored: true,
  });

  // ImmunityAnswer.sync()
  // .then(() => {
  //   console.log("ImmunityAnswer model synced successfully");
  // })
  // .catch((error) => {
  //   console.error("Error syncing ImmunityAnswer model:", error);
  // });

module.exports = ImmunityAnswer;