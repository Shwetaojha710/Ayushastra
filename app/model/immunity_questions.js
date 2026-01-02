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
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    hint: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Extra context shown below the question',
    },
    OptionA: {
      type: DataTypes.STRING,
      allowNull: true,
      
    },
    OptionA: {
      type: DataTypes.STRING,
      allowNull: true,
      
    },
    OptionB: {
      type: DataTypes.STRING,
      allowNull: true,
      
    },
    OptionC: {
      type: DataTypes.STRING,
      allowNull: true,
      
    },
    OptionD: {
      type: DataTypes.STRING,
      allowNull: true,
      
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