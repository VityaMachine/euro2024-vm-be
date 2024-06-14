const { Router } = require("express");

const authController = require("../controllers/auth.controller");
const predictionController = require("../controllers/predictions.controller");
const predictionsValidators = require("../validators/predictions.validators");

const predictionRouter = Router();

predictionRouter.post(
  "/",
  authController.authorize,
  predictionsValidators.validateNewPrediction,
  predictionController.newPredict
);

predictionRouter.get(
  "/",
  authController.authorize,
  predictionController.getPotentialMatches
);

predictionRouter.get(
  "/table",
  authController.authorize,
  predictionController.getRankingTable
);

module.exports = predictionRouter;
