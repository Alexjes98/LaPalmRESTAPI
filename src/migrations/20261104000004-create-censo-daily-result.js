"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CensoDailyResults", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      organizationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Organizations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      submissionCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      contributors: {
        type: Sequelize.JSON,
        allowNull: true,
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

    await queryInterface.addIndex("CensoDailyResults", ["loteId", "date"], {
      unique: true,
      name: "censo_daily_results_lote_date_unique",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("CensoDailyResults");
  },
};

