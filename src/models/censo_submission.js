"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CensoSubmission extends Model {
    static associate(models) {
      CensoSubmission.belongsTo(models.CensoDailyResult, {
        foreignKey: "dailyResultId",
        as: "dailyResult",
      });
      CensoSubmission.belongsTo(models.CensoLote, {
        foreignKey: "loteId",
        as: "lote",
      });
      CensoSubmission.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }
  CensoSubmission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      clientSubmissionId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      dailyResultId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      loteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      usuario: {
        type: DataTypes.STRING,
        allowNull: true,
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
      modelName: "CensoSubmission",
      tableName: "CensoSubmissions",
    }
  );
  return CensoSubmission;
};

