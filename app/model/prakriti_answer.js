  const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const { duration } = require("moment/moment");
  

const PrakaritiAnswer = sequelize.define('PrakaritiAnswer', {
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
    tableName: 'prakarti_answers',
    underscored: true,
  });

  // PrakaritiAnswer.sync({alter:true})
  // .then(() => {
  //   console.log("PrakaritiAnswer model synced successfully");
  // })
  // .catch((error) => {
  //   console.error("Error syncing PrakaritiAnswer model:", error);
  // });

module.exports = PrakaritiAnswer;