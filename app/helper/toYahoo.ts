export function toYahooSymbol(symbol: string) {
  if (symbol === "NIFTY 50") return "^NSEI";
  if (symbol === "NIFTY BANK") return "^NSEBANK";
  if (symbol === "INDIA VIX") return "^INDIAVIX";
  return `${symbol}.NS`;
}
