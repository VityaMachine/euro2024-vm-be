const predictionResultsCalculator = (
  homeGoals,
  awayGoals,
  homePrediction,
  awayPredition
) => {
  if (homeGoals === null || awayGoals === null) {
    return { points: null, text: "Матч не зіграний" };
  }

  if (homeGoals === homePrediction && awayGoals === awayPredition) {
    return { points: 3, text: "Точний рахунок" };
  }

  if (homeGoals - awayGoals === 0 && homePrediction - awayPredition === 0) {
    return { points: 1.75, text: "Нічия" };
  }

  if (homeGoals - awayGoals === homePrediction - awayPredition) {
    return { points: 1.5, text: "Різниця голів" };
  }

  if (
    (homeGoals - awayGoals < 0 && homePrediction - awayPredition < 0) ||
    (homeGoals - awayGoals > 0 && homePrediction - awayPredition > 0)
  ) {
    return { points: 1, text: "Результат" };
  }

  if (homeGoals + awayGoals === homePrediction + awayPredition) {
    return { points: 0.25, text: "Сума голів" };
  }

  return { points: 0, text: "Збіги відсутні" };
};

module.exports = predictionResultsCalculator;
