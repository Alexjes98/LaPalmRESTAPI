"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CensoSubmissions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      clientSubmissionId: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      dailyResultId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "CensoDailyResults",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      loteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "CensoLotes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      usuario: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      date: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      hour: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      finalizedTime: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      palmsCounted: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      includesPintones: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      densidadConPintones: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      hojasConPintones: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      pepasConPintones: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      densidadSinPintones: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      hojasSinPintones: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      pepasSinPintones: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      totalRff: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalHojas: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalPepas: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      longitud: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      latitud: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("CensoSubmissions");
  },
};

