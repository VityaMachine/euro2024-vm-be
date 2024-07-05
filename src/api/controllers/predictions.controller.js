const PredictionModel = require("../models/prediction.model");
const UserModel = require("../models/user.model");

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
      // status: "NS",
    });

    try {
      const fixtDataResp = await axios.request(reqOptions);
      const fixtData = fixtDataResp.data.response;
      const parsedFixtures = fixtureParser(fixtData);
      // const parsedFixtures = [...tempFixtData];

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

  async getRankingTable(req, res, next) {
    const reqOptions = axiosOptionsCreator("GET", "fixtures", {
      league: process.env.RA_LEAGUE,
      season: process.env.RA_SEASON,
      timezone: "Europe/Kiev",
      // status: "NS",
    });

    try {
      const fixtDataResp = await axios.request(reqOptions);
      const fixtData = fixtDataResp.data.response;
      const parsedFixtures = fixtureParser(fixtData);
      // const parsedFixtures = [...tempFixtData];

      const usersPredictions = await PredictionModel.findAll({});
      const usersData = await UserModel.findAll({});

      const predictionsWithResults = usersPredictions.map((prediction) => {
        const predFixtData = parsedFixtures.find(
          (fixture) => fixture.fixtureId === prediction.fixtureId
        );

        return {
          ...prediction.dataValues,
          matchStatus: predFixtData.statusShort,
          matchGoalsHome: predFixtData.homeTeamGoalsFT,
          matchGoalsAway: predFixtData.awayTeamGoalsFT,
        };
      });

      const finishedMatches = predictionsWithResults.filter(
        (item) =>
          item.matchStatus === "FT" ||
          item.matchStatus === "AET" ||
          item.matchStatus === "PEN"
      );

      const predictionsWithPts = finishedMatches.map((item) => {
        const calculatedResult = predictionResultsCalculator(
          item.matchGoalsHome,
          item.matchGoalsAway,
          item.homeTeamGoals,
          item.awayTeamGoals
        );

        return {
          ...item,
          predictionPts: calculatedResult.points,
          predictionText: calculatedResult.text,
        };
      });

      const usersIdsWithPredictions = predictionsWithPts
        .map((item) => item.userId)
        .filter((item, i, ar) => ar.indexOf(item) === i);

      const byUsersPredictions = usersIdsWithPredictions.map((item) => {
        const userPred = predictionsWithPts.filter(
          (pred) => pred.userId === item
        );

        return {
          userId: item,
          userPredData: {
            exactScore: userPred.filter((item) => item.predictionPts === 3)
              .length,
            draw: userPred.filter((item) => item.predictionPts === 1.75).length,
            goalsDIff: userPred.filter((item) => item.predictionPts === 1.5)
              .length,
            result: userPred.filter((item) => item.predictionPts === 1).length,
            sumGoals: userPred.filter((item) => item.predictionPts === 0.25)
              .length,
            noMatched: userPred.filter((item) => item.predictionPts === 0)
              .length,
          },
        };
      });

      const totalPtsByUsers = byUsersPredictions.map((item) => ({
        ...item,
        userPredData: {
          ...item.userPredData,
          total:
            item.userPredData.exactScore * 3 +
            item.userPredData.draw * 1.75 +
            item.userPredData.goalsDIff * 1.5 +
            item.userPredData.result * 1 +
            item.userPredData.sumGoals * 0.25,
        },
      }));

      const totalPtsByUsersWithNames = totalPtsByUsers.map((item) => {
        const userDetails = usersData.find((user) => user.id === item.userId);

        const userRespData = {
          userFirstName: userDetails.firstname,
          userLastName: userDetails.secondname,
          userName: userDetails.username,
        };

        return {
          ...userRespData,
          ...item,
        };
      });

      // return res.send(finishedMatches)

      // sorting

      totalPtsByUsersWithNames.sort(
        (a, b) => b.userPredData.sumGoals - a.userPredData.sumGoals
      );
      totalPtsByUsersWithNames.sort(
        (a, b) => b.userPredData.result - a.userPredData.result
      );
      totalPtsByUsersWithNames.sort(
        (a, b) => b.userPredData.goalsDIff - a.userPredData.goalsDIff
      );
      totalPtsByUsersWithNames.sort(
        (a, b) => b.userPredData.draw - a.userPredData.draw
      );
      totalPtsByUsersWithNames.sort(
        (a, b) => b.userPredData.exactScore - a.userPredData.exactScore
      );
      totalPtsByUsersWithNames.sort(
        (a, b) => b.userPredData.total - a.userPredData.total
      );

      return res.json(totalPtsByUsersWithNames);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PredictionController();
