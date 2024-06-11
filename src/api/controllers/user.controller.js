const UserModel = require("../models/user.model");

require("dotenv").config();

class UserController {
  async getCurrentUser(req, res, next) {
    const user = req.user;

    return res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      firstname: user.firstname,
      secondname: user.secondname,
      birthdate: user.birthdate,
    });
  }

  async verifyUser(req, res, next) {
    const { verifyToken } = req.params;

    const user = await UserModel.findOne({
      where: {
        verificationToken: verifyToken,
      },
    });

    if (!user) {
      return res.status(404).send({ message: "Not found" });
    }

    await UserModel.update(
      {
        isVerified: true,
        verificationToken: null,
      },
      {
        where: {
          id: user.id,
        },
      }
    );

    return res.send(
      `<h2>Dear ${user.username}, your account is confirmed, now u can go to <a href="https://vm-euro2024.vercel.app/">main page</a></h2>`
    );
  }
}

module.exports = new UserController();
