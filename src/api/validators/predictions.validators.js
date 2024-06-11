const Joi = require("joi");
const axios = require("axios");

const PredictionModel = require("../models/prediction.model");

const axiosOptionsCreator = require("../../helpers/axios.options.creator");
const fixtureParser = require("../../utils/parsers/fixtures.parser");

require("dotenv").config();

// const tempFixtData = require("../../temp/fixtures.json");

class PredictionValidators {
  async validateNewPrediction(req, res, next) {
    const newPredictionSchema = Joi.object({
      fixtureId: Joi.number().integer().required(),
      homeTeamGoals: Joi.number().integer().required(),
      awayTeamGoals: Joi.number().integer().required(),
    });

    const data = req.body;
    const user = req.user;

    const validationResult = newPredictionSchema.validate(data);

    if (validationResult.error) {
      return res.status(400).send(validationResult.error);
    }

    const reqOptions = axiosOptionsCreator("GET", "fixtures", {
      league: process.env.RA_LEAGUE,
      season: process.env.RA_SEASON,
      timezone: "Europe/Kiev",
      status: "NS",
    });

    try {
      const fixtDataResp = await axios.request(reqOptions);
      const fixtData = fixtDataResp.data.response;
      const parsedFixtures = fixtureParser(fixtData);

      // const parsedFixtures = [...tempFixtData];

      const userPredictions = await PredictionModel.findAll({
        where: { userId: user.id },
      });

      const userPredictionIds = userPredictions.map((item) => item.fixtureId);

      const avaliableFixtures = parsedFixtures.filter(
        (item) => !userPredictionIds.includes(item.fixtureId)
      );

      const avaliableFixturesIds = avaliableFixtures.map(
        (item) => item.fixtureId
      );

      if (userPredictionIds.includes(data.fixtureId)) {
        return res
          .status(400)
          .send({ message: "Prediction on this match was already done" });
      }

      if (!avaliableFixturesIds.includes(data.fixtureId)) {
        return res
          .status(400)
          .send({ message: "Wrond matchId to make prediction" });
      }

      const fixt2prediction = parsedFixtures.find(
        (item) => item.fixtureId === data.fixtureId
      );

      if (["1H", "2H", "HT", "FT"].includes(fixt2prediction.statusShort)) {
        return res.status(400).send({
          message: "Match already started or finished",
        });
      }


      req.fixtures = parsedFixtures;


      next();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PredictionValidators();
