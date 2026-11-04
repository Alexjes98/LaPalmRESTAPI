"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CensoLote extends Model {
    static associate(models) {
      CensoLote.belongsTo(models.Organization, {
        foreignKey: "organizationId",
        as: "organization",
      });
      CensoLote.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "creator",
      });
      CensoLote.hasMany(models.CensoDailyResult, {
        foreignKey: "loteId",
        as: "dailyResults",
        onDelete: "CASCADE",
      });
      CensoLote.hasMany(models.CensoSubmission, {
        foreignKey: "loteId",
        as: "submissions",
        onDelete: "CASCADE",
      });
    }
  }
  CensoLote.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      createdAtDate: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      lastCensusDate: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      censusCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "CensoLote",
      tableName: "CensoLotes",
    }
  );
  return CensoLote;
};

