require("dotenv").config();

const axiosOptionsCreator = (method, url, reqParams) => ({
  method: method,
  url: `https://api-football-v1.p.rapidapi.com/v3/${url}`,
  params: {
    ...reqParams,
  },
  headers: {
    "x-rapidapi-key": process.env.RA_APIKEY,
    "x-rapidapi-host": process.env.RA_HOST,
  },
});

module.exports = axiosOptionsCreator;
