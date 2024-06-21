const { Op } = require("sequelize");
const UserModel = require("../models/user.model");

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const sendEmailVerification = require("../../utils/nodemailer.signUp");
const sendResetPwdVerification = require("../../utils/nodemailer.resetPwd");

require("dotenv").config();

class AuthController {
  async signUp(req, res, next) {
    try {
      const data = req.body;
      const verificationToken = uuidv4();
      const userId = uuidv4();

      const pwdHash = await bcryptjs.hash(
        data.password,
        Number(process.env.PWD_COST)
      );

      const newUser = await UserModel.create({
        ...data,
        id: userId,
        password: pwdHash,
        verificationToken,
        username: data.username.toLowerCase(),
      });

      const respData = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      };

      await sendEmailVerification(newUser.email, newUser);

      res.status(201).json(respData);
    } catch (error) {
      next(error);
    }
  }

  async signIn(req, res, next) {
    try {
      const { login, password } = req.body;

      const targetUser = await UserModel.findOne({
        where: {
          [Op.or]: [{ username: login.toLowerCase() }, { email: login }],
        },
      });

      if (!targetUser) {
        return res.status(404).send({ message: `User ${login} not found` });
      }

      if (!targetUser.isVerified) {
        return res.status(403).send({ message: "Email is not confirmed" });
      }

      const isPasswordValid = await bcryptjs.compare(
        password,
        targetUser.password
      );

      if (!isPasswordValid) {
        return res.status(401).send({ message: `Authentication failed` });
      }

      const jwtToken = await jwt.sign(
        {
          id: targetUser.id,
        },
        process.env.PWD_SECRET
      );

      await UserModel.update(
        {
          token: jwtToken,
        },
        {
          where: {
            id: targetUser.id,
          },
        }
      );

      return res.status(200).send({
        token: jwtToken,
        user: {
          id: targetUser.id,
          username: targetUser.username,
          email: targetUser.email,
          firstname: targetUser.firstname,
          secondname: targetUser.secondname,
          birthdate: targetUser.birthdate,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async authorize(req, res, next) {
    try {
      const authorizationHeader = req.get("Authorization");
      const token = authorizationHeader.replace("Bearer ", "");

      const userId = await jwt.verify(token, process.env.PWD_SECRET).id;

      if (!userId) {
        return res.status(403).send({ message: "Wrong authorization data" });
      }

      const user = await UserModel.findOne({
        where: {
          id: userId,
        },
      });

      if (!user || !user.token) {
        return res.status(403).send({ message: "Unauthorized" });
      }

      req.user = user;
      req.token = token;

      next();
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const user = req.user;

      await UserModel.update(
        {
          token: null,
        },
        {
          where: {
            id: user.id,
          },
        }
      );

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    const user = req.user.dataValues;

    const resetToken = uuidv4();

    try {
      await UserModel.update(
        {
          verificationToken: resetToken,
        },
        {
          where: {
            id: user.id,
          },
        }
      );

      const updatedUser = await UserModel.findOne({
        where: {
          id: user.id,
        },
      });

      const respData = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
      };

      await sendResetPwdVerification(updatedUser.email, updatedUser);

      return res.send(respData);
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(req, res, next) {
    const data = req.body;
    const user = req.user;

    const newPwdHash = await bcryptjs.hash(
      data.password,
      Number(process.env.PWD_COST)
    );

    try {
      await UserModel.update(
        {
          password: newPwdHash,
          verificationToken: null,
          token: null,
        },
        {
          where: {
            id: user.id,
          },
        }
      );

      return res.send({
        message: "Password successfuly changed",
      });
    } catch (error) {
      next(error);
    }

    return res.send(newPwdHash);
  }
}

module.exports = new AuthController();
