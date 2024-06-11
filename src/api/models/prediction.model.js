const Sequelize = require("sequelize");

const sequelize = require("../../db/connect.db");

const PredictionModel = sequelize.define(
  "PredictionModel",
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    fixtureId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    homeTeamGoals: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    awayTeamGoals: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Predictions",
  }
);

module.exports = PredictionModel;