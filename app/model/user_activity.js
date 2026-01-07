const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

  const UserActivity = sequelize.define("UserActivity", {
    id: { type: DataTypes.INTEGER, autoIncrement:true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    activity_type: {
      type: DataTypes.ENUM("like", "share", "assessment", "prakrati_parikshan"),
      allowNull: false,
    },
    reward_given: { type: DataTypes.BOOLEAN, defaultValue: false },
  });
// UserActivity.sync({alter:true}).then(() => {
//     console.log('UserActivity model synced successfully');
// }).catch((error) => {
//     console.error('Error syncing UserActivity model:', error);
// });

module.exports = UserActivity;
