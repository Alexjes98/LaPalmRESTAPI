"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DailyRegister extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DailyRegister.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      DailyRegister.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "company",
      });
      // define association here
    }
  }
  //TODO Add employeeId, BatchId, FrontId, GondolaId, EquipmentId, supervisorId (EmployeeId)
  //TODO Add quantities values
  DailyRegister.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      body: DataTypes.TEXT,
      registerDate: DataTypes.DATE,
      userId: DataTypes.INTEGER,
      companyId: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "DailyRegister",
      tableName: "DailyRegisters",
    }
  );
  return DailyRegister;
};
