"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "company",
      });
      // define association here
    }
  }
  User.init(
    {
      id: DataTypes.INTEGER,
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      companyId: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
