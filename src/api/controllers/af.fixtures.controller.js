const axios = require("axios");
const axiosOptionsCreator = require("../../helpers/axios.options.creator");
const fixtureParser = require("../../utils/parsers/fixtures.parser");

require("dotenv").config();

class FixturesController {
  async getAllFixtures(req, res, next) {
    const reqOptions = axiosOptionsCreator("GET", "fixtures", {
      league: process.env.RA_LEAGUE,
      season: process.env.RA_SEASON,
    });

    try {
      const apiResp = await axios.request(reqOptions);

      const data = apiResp.data.response;

      const parsedData = fixtureParser(data);

      return res.json(parsedData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FixturesController();
