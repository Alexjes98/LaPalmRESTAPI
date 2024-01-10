"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Employee.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "company",
      });
      Employee.belongsTo(models.Position, {
        foreignKey: "positionId",
        as: "position",
      });
      // define association here
    }
  }
  Employee.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      code: DataTypes.STRING,
      payrollType: DataTypes.BOOLEAN,
      companyId: DataTypes.INTEGER,
      positionId: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Employee",
      tableName: "Employees",
    }
  );
  return Employee;
};
