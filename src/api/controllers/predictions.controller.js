const PredictionModel = require("../models/prediction.model");

const { v4: uuidv4 } = require("uuid");

const axios = require("axios");
const axiosOptionsCreator = require("../../helpers/axios.options.creator");
const fixtureParser = require("../../utils/parsers/fixtures.parser");
const predictionResultsCalculator = require("../../utils/prediction.result.calculator");

require("dotenv").config();

const tempFixtData = require("../../temp/fixtures.json");

class PredictionController {
  async getPotentialMatches(req, res, next) {
    const user = req.user;

    const reqOptions = axiosOptionsCreator("GET", "fixtures", {
      league: process.env.RA_LEAGUE,
      season: process.env.RA_SEASON,
      timezone: "Europe/Kiev",
      status: "NS",
    });

    try {
      // const fixtDataResp = await axios.request(reqOptions);
      // const fixtData = fixtDataResp.data.response;
      // const parsedFixtures = fixtureParser(fixtData);
      const parsedFixtures = [...tempFixtData];

      const userPredictions = await PredictionModel.findAll({
        where: { userId: user.id },
      });

      const userPredictionsIds = userPredictions.map((item) => item.fixtureId);

      const predictionsData = parsedFixtures.map((fixture) => ({
        fixtureId: fixture.fixtureId,
        date_text: fixture.date_text,
        dateTime: fixture.dateTime,
        statusShort: fixture.statusShort,
        round: fixture.round,
        online: fixture.online,
        homeTeamNameOriginal: fixture.homeTeamNameOriginal,
        homeTeamId: fixture.homeTeamId,
        homeTeamLogo: fixture.homeTeamLogo,
        homeTeamGoalsFT: fixture.homeTeamGoalsFT,
        homeTeamResult: fixture.homeTeamResult,
        awayTeamNameOriginal: fixture.awayTeamNameOriginal,
        awayTeamId: fixture.awayTeamId,
        awayTeamLogo: fixture.awayTeamLogo,
        awayTeamGoalsFT: fixture.awayTeamGoalsFT,
        awayTeamResult: fixture.awayTeamResult,

        prediction: userPredictionsIds.includes(fixture.fixtureId)
          ? userPredictions.find(
              (prediction) => prediction.fixtureId === fixture.fixtureId
            )
          : null,
      }));

      const calculatedPredicions = predictionsData.map((predictionItem) => {


        // console.log(predictionItem);

        return {
          ...predictionItem,
          prediction: predictionItem.prediction
            ? {
                ...predictionItem.prediction.dataValues,
                predictionResult: predictionResultsCalculator(
                  predictionItem.homeTeamGoalsFT,
                  predictionItem.awayTeamGoalsFT,
                  predictionItem.prediction.homeTeamGoals,
                  predictionItem.prediction.awayTeamGoals
                ),
              }
            : null,
        };
      });

      res.status(200).json(calculatedPredicions);
    } catch (error) {
      next(error);
    }
  }

  async newPredict(req, res, next) {
    const user = req.user;
    const predictionData = req.body;

    const predictionId = uuidv4();

    const newPredictionData = {
      id: predictionId,
      userId: user.id,
      ...predictionData,
    };

    try {
      const newPredictionRespData = await PredictionModel.create(
        newPredictionData
      );

      console.log(newPredictionRespData);

      return res.send(newPredictionRespData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PredictionController();
