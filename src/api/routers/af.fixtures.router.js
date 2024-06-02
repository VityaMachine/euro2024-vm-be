const { Router } = require("express");
const fixturesController = require("../controllers/af.fixtures.controller");

const fixturesRouter = Router();

fixturesRouter.get("/all", fixturesController.getAllFixtures);


module.exports = fixturesRouter;