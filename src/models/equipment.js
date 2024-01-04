"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Equipment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Equipment.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "company",
      });
      // define association here
    }
  }
  Equipment.init(
    {
      id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      companyId: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Equipment",
    }
  );
  return Equipment;
};
