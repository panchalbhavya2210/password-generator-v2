const NSE = "https://www.nseindia.com";

let cookieStore: string | null = null;
let lastFetch = 0;

const COOKIE_TTL = 25 * 60 * 1000;

export async function getNseCookie() {
  const now = Date.now();

  if (cookieStore && now - lastFetch < COOKIE_TTL) {
    return cookieStore;
  }

  const res = await fetch(NSE, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
      Connection: "keep-alive",
    },
    cache: "no-store",
  });

  const raw = res.headers.getSetCookie();

  const cookies = raw.map((c) => c.split(";")[0]).join("; ");

  if (!cookies) throw new Error("No NSE cookies");

  cookieStore = cookies;
  lastFetch = now;

  return cookieStore;
}
