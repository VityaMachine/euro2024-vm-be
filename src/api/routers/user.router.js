const { Router } = require("express");

const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

const userRouter = Router();

userRouter.get("/", authController.authorize, userController.getCurrentUser);

userRouter.get("/verify/:verifyToken", userController.verifyUser);

module.exports = userRouter;
