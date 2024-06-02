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
}

module.exports = new AuthValidators();
