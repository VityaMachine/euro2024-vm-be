const fixtureResultHandler = (teamForGoals, teamAgainstGoals) => {
  if (teamForGoals === null || teamAgainstGoals === null) {
    return null;
  }

  if (
    typeof teamForGoals === "number" &&
    typeof teamAgainstGoals === "number"
  ) {
    if (teamForGoals > teamAgainstGoals) {
      return "W";
    }
    if (teamForGoals === teamAgainstGoals) {
      return "D";
    }
    if (teamForGoals < teamAgainstGoals) {
      return "L";
    }
  }

  return null;
};

const fixtureParser = (data) => {
  return data.map((item) => {
    return {
      fixtureId: item.fixture.id,
      date_text: item.fixture.date,
      dateTime: new Date(item.fixture.date),
      referee: item.fixture.referee,
      statusLong: item.fixture.status.long,
      statusShort: item.fixture.status.short,
      city: item.fixture.venue.city,
      stadiumName: item.fixture.venue.name,
      stadiumId: item.fixture.venue.id,
      round: item.league.round,
      // roundName: item.league.round.includes('Regular Season') ? `Round - ${item.league.round.split('Regular Season - ')[1]}` : item.league.round,
      leagueId: item.league.id,
      leagueName: item.league.name,

      online: ["1H", "2H", "HT"].includes(item.fixture.status.short)
        ? {
            elapsedTime: item.fixture.status.elapsed,
            goalsHome: item.goals.home ? item.goals.home : 0,
            goalsAway: item.goals.away ? item.goals.away : 0,
          }
        : null,
      homeTeamNameOriginal: item.teams.home.name,
      homeTeamId: item.teams.home.id,
      homeTeamLogo: item.teams.home.logo,
      homeTeamGoalsHT: item.score.halftime.home,
      homeTeamGoalsFT: item.score.fulltime.home,
      homeTeamResult: fixtureResultHandler(
        item.score.fulltime.home,
        item.score.fulltime.away
      ),

      awayTeamNameOriginal: item.teams.away.name,
      awayTeamId: item.teams.away.id,
      awayTeamLogo: item.teams.away.logo,
      awayTeamGoalsHT: item.score.halftime.away,
      awayTeamGoalsFT: item.score.fulltime.away,
      awayTeamResult: fixtureResultHandler(
        item.score.fulltime.away,
        item.score.fulltime.home
      ),
    };
  });
};

module.exports = fixtureParser;
