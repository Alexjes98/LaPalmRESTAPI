"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Organization extends Model {
    static associate(models) {
      Organization.belongsTo(models.User, {
        foreignKey: "ownerId",
        as: "owner",
      });
      Organization.hasMany(models.OrganizationMember, {
        foreignKey: "organizationId",
        as: "members",
        onDelete: "CASCADE",
      });
      Organization.hasMany(models.CensoLote, {
        foreignKey: "organizationId",
        as: "lotes",
        onDelete: "CASCADE",
      });
      Organization.hasMany(models.CensoDailyResult, {
        foreignKey: "organizationId",
        as: "dailyResults",
        onDelete: "CASCADE",
      });
    }
  }
  Organization.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Organization",
      tableName: "Organizations",
    }
  );
  return Organization;
};

