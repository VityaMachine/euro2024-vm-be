const Sequelize = require("sequelize");

require("dotenv").config();

const sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      dialect: "mysql",
      host: process.env.DB_HOST,
      timezone: "+02:00",
    }
  );
  
  module.exports = sequelize;