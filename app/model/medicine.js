const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const TblMedicine = sequelize.define(
  "TblMedicine",
  {
    Id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: true,
    },
    MedicineName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Packing: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    MRP: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    GST: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CreatedDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CreatedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Isdeleted: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Remark: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "TblMedicine",
    schema: "public",
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = TblMedicine;
