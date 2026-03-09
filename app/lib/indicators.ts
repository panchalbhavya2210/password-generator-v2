import { SMA, EMA, RSI, MACD, BollingerBands } from "technicalindicators";

/* ---------- helpers ---------- */

export function mapIndicatorToChart(
  times: number[],
  values: number[],
  offset: number,
) {
  const result: { time: number; value: number }[] = [];

  for (let i = 0; i < values.length; i++) {
    result.push({
      time: times[i + offset],
      value: values[i],
    });
  }

  return result;
}

/* ---------- moving averages ---------- */

export function SMAIndicator(
  times: number[],
  closes: number[],
  period: number,
) {
  const values = SMA.calculate({ period, values: closes });
  return mapIndicatorToChart(times, values, period - 1);
}

export function EMAIndicator(
  times: number[],
  closes: number[],
  period: number,
) {
  const values = EMA.calculate({ period, values: closes });
  return mapIndicatorToChart(times, values, period - 1);
}

/* ---------- RSI ---------- */

export function RSIIndicator(times: number[], closes: number[], period = 14) {
  const values = RSI.calculate({ period, values: closes });
  return mapIndicatorToChart(times, values, period);
}

/* ---------- Bollinger Bands ---------- */

export function BBIndicator(times: number[], closes: number[], period = 20) {
  const values = BollingerBands.calculate({
    period,
    values: closes,
    stdDev: 2,
  });

  const middle = [];
  const upper = [];
  const lower = [];

  for (let i = 0; i < values.length; i++) {
    middle.push({ time: times[i + period - 1], value: values[i].middle });
    upper.push({ time: times[i + period - 1], value: values[i].upper });
    lower.push({ time: times[i + period - 1], value: values[i].lower });
  }

  return { middle, upper, lower };
}
