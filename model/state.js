const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");

  const State = sequelize.define('State', {
    pk_uniqueid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    statename: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state_name_en: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isdeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    deletedby: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    updatedby: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    updateddated: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    ogr_geometry: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    latitude: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
      defaultValue: null
    },
    longitude: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: true,
      defaultValue: null
    },
    x_min: {
      type: DataTypes.DECIMAL(18, 10),
      allowNull: true,
      defaultValue: null
    },
    y_min: {
      type: DataTypes.DECIMAL(18, 10),
      allowNull: true,
      defaultValue: null
    },
    x_max: {
      type: DataTypes.DECIMAL(18, 10),
      allowNull: true,
      defaultValue: null
    },
    y_max: {
      type: DataTypes.DECIMAL(18, 10),
      allowNull: true,
      defaultValue: null
    }
  }, {
    tableName: 'state',
    timestamps: false
  });

module.exports=State


