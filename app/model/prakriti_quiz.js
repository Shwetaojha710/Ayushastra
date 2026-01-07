  const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const { duration } = require("moment/moment");

const prakritiQuiz = sequelize.define('prakriti_quiz', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quiz_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Immunity - Mind Body Type 2',
    },
    total_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    percentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    result_label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'prakriti_quiz',
    underscored: true,
  });

  // prakritiQuiz.sync({alter:true})
  // .then(() => {
  //   console.log("prakritiQuiz model synced successfully");
  // })
  // .catch((error) => {
  //   console.error("Error syncing prakritiQuiz model:", error);
  // });

module.exports = prakritiQuiz;