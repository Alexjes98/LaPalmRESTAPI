"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CensoDailyResult extends Model {
    static associate(models) {
      CensoDailyResult.belongsTo(models.CensoLote, {
        foreignKey: "loteId",
        as: "lote",
      });
      CensoDailyResult.belongsTo(models.Organization, {
        foreignKey: "organizationId",
        as: "organization",
      });
      CensoDailyResult.hasMany(models.CensoSubmission, {
        foreignKey: "dailyResultId",
        as: "submissions",
        onDelete: "CASCADE",
      });
    }
  }
  CensoDailyResult.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      loteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      hour: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      finalizedTime: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      palmsCounted: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      includesPintones: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      densidadConPintones: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      hojasConPintones: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      pepasConPintones: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      densidadSinPintones: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      hojasSinPintones: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      pepasSinPintones: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      totalRff: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalHojas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalPepas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      submissionCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      contributors: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      longitud: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      latitud: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "CensoDailyResult",
      tableName: "CensoDailyResults",
    }
  );
  return CensoDailyResult;
};

