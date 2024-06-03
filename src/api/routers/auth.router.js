const { Router } = require("express");
const authValidators = require("../validators/auth.validators");
const authController = require("../controllers/auth.controller");
const authRouter = Router();

authRouter.post(
  "/sign-up",
  authValidators.validateSignUp,
  authController.signUp
);

authRouter.post(
  "/sign-in",
  authValidators.validateSignIn,
  authController.signIn
);

authRouter.patch("/logout", authController.authorize, authController.logout);

module.exports = authRouter;
