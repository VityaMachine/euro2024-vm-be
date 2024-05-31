const { Op } = require("sequelize");
const UserModel = require("../models/user.model");

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const sendEmailVerification = require("../../utils/nodemailer");

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
      };

      await sendEmailVerification(newUser.email, newUser);

      // console.log(mailResult);

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
}

module.exports = new AuthController();
