"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("CensoDailyResults", "diasCiclo", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("CensoSubmissions", "diasCiclo", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("CensoDailyResults", "diasCiclo");
    await queryInterface.removeColumn("CensoSubmissions", "diasCiclo");
  },
};

