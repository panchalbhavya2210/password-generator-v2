export type BreadthInput = {
  advances: number | string;
  declines: number | string;
  unchanged?: number | string;
};

export function calculateBreadth(data: BreadthInput) {
  const adv = Number(data.advances ?? 0);
  const dec = Number(data.declines ?? 0);
  const unc = Number(data.unchanged ?? 0);

  const total = adv + dec + unc;

  if (total === 0) {
    return {
      adv: 0,
      dec: 0,
      unc: 0,
      advPercent: 0,
      decPercent: 0,
      uncPercent: 0,
      ratio: 0,
      sentiment: "neutral" as const,
    };
  }

  const advPercent = (adv / total) * 100;
  const decPercent = (dec / total) * 100;
  const uncPercent = (unc / total) * 100;

  const ratio = dec === 0 ? adv : adv / dec;

  let sentiment: "bullish" | "bearish" | "neutral" = "neutral";
  if (advPercent > decPercent + 10) sentiment = "bullish";
  else if (decPercent > advPercent + 10) sentiment = "bearish";

  return {
    adv,
    dec,
    unc,
    advPercent,
    decPercent,
    uncPercent,
    ratio,
    sentiment,
  };
}
