const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const slots = sequelize.define(
  "slots",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    clinicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    session: {
      type: DataTypes.ENUM("morning", "evening"),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
   isBooked: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: "slots",
    underscored: true,
  }
);

slots
  .sync({ alter: true })
  .then(() => {
    console.log("slots model synced successfully");
  })
  .catch((error) => {
    console.error("Error syncing slots model:", error);
  });

module.exports = slots;
