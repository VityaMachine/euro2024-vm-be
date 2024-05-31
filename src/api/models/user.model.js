const Sequelize = require("sequelize");

const sequelize = require("../../db/connect.db");

const UserModel = sequelize.define(
  "UserModel",
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: Sequelize.STRING(30),
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
        len: [5, 30],
      },
    },
    email: {
      type: Sequelize.STRING(50),
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
        isEmail: true,
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    firstname: {
      type: Sequelize.STRING(30),
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
      },
    },
    secondname: {
      type: Sequelize.STRING(30),
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
      },
    },

    birthdate: {
      type: Sequelize.STRING(10),
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true,
      },
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    verificationToken: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    token: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Users",
  }
);

module.exports = UserModel;
