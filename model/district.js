const { DataTypes } = require("sequelize");
const sequelize = require("../app/connection/connection");

  const District = sequelize.define('District', {
    pk_uniqueid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    districtname: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
   created_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    division_id:{
      type:DataTypes.INTEGER,
      allowNull:true
    }
   
  }, {
    tableName: 'district',
    timestamps: false
  });

  // District.sync({alter:true}).then(() => {
  //        console.log("Database & tables created!");
  //    })
  //    .catch((error) => {
  //        console.error("Error creating database & tables:", error);
  //    });

module.exports=District


