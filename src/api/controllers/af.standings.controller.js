const axios = require("axios");
const axiosOptionsCreator = require("../../helpers/axios.options.creator");

require("dotenv").config();

class StandingsController {
  async getStandingsData(req, res, next) {
    const reqOptions = axiosOptionsCreator("GET", "standings", {
      league: process.env.RA_LEAGUE,
      season: process.env.RA_SEASON,
    });

    try {
      const apiResp = await axios.request(reqOptions);

      const data = apiResp.data.response;

      const standingsData = data[0].league.standings;

      return res.json(standingsData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StandingsController();
