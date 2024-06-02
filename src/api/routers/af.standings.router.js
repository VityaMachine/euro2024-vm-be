const { Router } = require("express");
const standingsController = require("../controllers/af.standings.controller");

const standingsRouter = Router();

standingsRouter.get("/", standingsController.getStandingsData);

module.exports = standingsRouter;
