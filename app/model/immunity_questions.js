  const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const { duration } = require("moment/moment");
  
  const ImmunityQuestion = sequelize.define('ImmunityQuestion', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    quiz_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Immunity - Mind Body Type 2',
    },
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Extra context shown below the question',
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['Never', 'Rarely', 'Often', 'Always'],
    },
    order_no: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'immunity_questions',
    underscored: true,
  });

  
// ImmunityQuestion.sync()
//   .then(() => {
//     console.log("ImmunityQuestion model synced successfully");
//   })
//   .catch((error) => {
//     console.error("Error syncing ImmunityQuestion model:", error);
//   });

module.exports = ImmunityQuestion;