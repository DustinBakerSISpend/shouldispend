export function calculateRentVerdict({
  income,
  savings,
  rent,
  debt,
}) {
  if (!income || !rent) {
    return {
      error: "Please enter income and rent.",
    };
  }

  const rentRatio = rent / income;
  const debtRatio = debt / income;

  let score = 100;

  score -= rentRatio * 120;
  score -= debtRatio * 45;

  if (rentRatio > 0.35 && savings < rent * 3) {
    score -= 18;
  } else if (rentRatio > 0.25 && savings < rent * 6) {
    score -= 10;
  }

  score = Math.max(5, Math.min(100, Math.round(score)));

  let verdict = "";
  let color = "#0f766e";

  if (score >= 80) {
    verdict = "Comfortable Rent";
    color = "#16a34a";
  } else if (score >= 60) {
    verdict = "Manageable With Guardrails";
    color = "#eab308";
  } else if (score >= 40) {
    verdict = "Financial Stretch";
    color = "#f97316";
  } else {
    verdict = "High Risk Housing Cost";
    color = "#dc2626";
  }

  return {
    error: null,
    score,
    verdict,
    color,
    rentPercent: rentRatio * 100,
    debtPercent: debtRatio * 100,
    savingsMonths: savings ? savings / rent : 0,
  };
}