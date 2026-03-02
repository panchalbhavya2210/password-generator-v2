import axios from "axios";
import { NextResponse } from "next/server";
import { toYahooSymbol } from "@/app/helper/toYahoo";

function mapResolution(res: string) {
  const map: any = {
    "1": "1m",
    "5": "5m",
    "15": "15m",
    "60": "60m",
    "1D": "1d",
    "1W": "1wk",
    "1M": "1mo",
  };
  return map[res] || "1d";
}

function getYahooRange(resolution: string) {
  if (resolution === "1") return "8d";
  if (resolution === "5") return "60d";
  if (resolution === "15") return "60d";
  if (resolution === "60") return "730d";
  return "max";
}

// Yahoo interval limits
function clampFrom(interval: string, from: number, to: number) {
  const limits: any = {
    "1m": 7,
    "5m": 60,
    "15m": 60,
    "60m": 730,
  };

  if (!limits[interval]) return from;

  const maxSeconds = limits[interval] * 24 * 60 * 60;
  return Math.max(from, to - maxSeconds);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const symbol = searchParams.get("symbol")!;
  const resolution = searchParams.get("resolution")!;
  let from = Number(searchParams.get("from")!);
  const to = Number(searchParams.get("to")!);

  const interval = mapResolution(resolution);
  from = clampFrom(interval, from, to);

  const yahooSymbol = toYahooSymbol(symbol);

  const range = getYahooRange(resolution);

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${interval}&range=${range}`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      timeout: 10000,
    });

    // ❗ handle yahoo error
    if (!data?.chart?.result?.[0]) {
      return NextResponse.json({ t: [], o: [], h: [], l: [], c: [], v: [] });
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const quote = result.indicators.quote[0];

    const t: number[] = [];
    const o: number[] = [];
    const h: number[] = [];
    const l: number[] = [];
    const c: number[] = [];
    const v: number[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      // ❗ filter bad candles
      if (
        quote.open[i] == null ||
        quote.high[i] == null ||
        quote.low[i] == null ||
        quote.close[i] == null
      )
        continue;

      t.push(timestamps[i]);
      o.push(quote.open[i]);
      h.push(quote.high[i]);
      l.push(quote.low[i]);
      c.push(quote.close[i]);
      v.push(quote.volume[i] ?? 0);
    }

    return NextResponse.json({ t, o, h, l, c, v });
  } catch (e) {
    return NextResponse.json({ t: [], o: [], h: [], l: [], c: [], v: [] });
  }
}
