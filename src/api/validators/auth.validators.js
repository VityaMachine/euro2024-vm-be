const Joi = require("joi");

const UserModel = require("../models/user.model");

class AuthValidators {
  async validateSignUp(req, res, next) {
    const newUserSchema = Joi.object({
      firstname: Joi.string().min(3).max(30).required(),
      secondname: Joi.string().min(3).max(30).required(),
      username: Joi.string().min(5).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
        )
        .min(8)
        .max(25)
        .required(),

      birthdate: Joi.string().length(10),
    });

    const data = req.body;

    const validationResult = newUserSchema.validate(data);

    if (validationResult.error) {
      return res.status(400).send(validationResult.error);
    }

    const allUsers = await UserModel.findAll({});

    const isNewUserUnique = !allUsers.some(
      (user) =>
        user.username.toLowerCase() === data.username.toLowerCase() ||
        user.email.toLowerCase() === data.email.toLowerCase()
    );

    if (!isNewUserUnique) {
      return res
        .status(409)
        .send({ message: "username or email is already used" });
    }

    next();
  }

  validateSignIn(req, res, next) {
    const signInSchema = Joi.object({
      login: Joi.string().required(),
      password: Joi.string().required(),
    });

    const data = req.body;

    const validationResult = signInSchema.validate(data);

    if (validationResult.error) {
      return res.status(400).send(validationResult.error);
    }

    next();
  }

  async validateResetPassword(req, res, next) {
    const data = req.body;

    const validateSchema = Joi.object({
      email: Joi.string().email().required(),
    });

    const validationResult = validateSchema.validate(data);

    if (validationResult.error) {
      return res.status(400).send(validationResult.error);
    }

    try {
      const targetUser = await UserModel.findOne({
        where: {
          email: data.email,
        },
      });

      if (!targetUser) {
        return res.status(404).send({ message: "email is not registered" });
      }

      if (!targetUser.isVerified) {
        return res.status(400).send({ message: "user is not verified" });
      }

      req.user = targetUser;
      next();
    } catch (error) {
      next(error);
    }
  }

  async validateUpdatePassword(req, res, next) {
    const data = req.body;

    const newPwdSchema = Joi.object({
      password: Joi.string()
        .pattern(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
        )
        .min(8)
        .max(25)
        .required(),

      resetToken: Joi.string().required(),
    });

    const validationResult = newPwdSchema.validate(data);

    if (validationResult.error) {
      return res.status(400).send(validationResult.error);
    }

    try {
      const targetUser = await UserModel.findOne({
        where: {
          verificationToken: data.resetToken,
        },
      });

      if (!targetUser) {
        return res
          .status(404)
          .send({ message: "Wrong reset token. Target user not found" });
      }

      req.user = targetUser;
      next();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthValidators();
