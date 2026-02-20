import { NextResponse } from "next/server";

const NSE = "https://www.nseindia.com";

export async function GET() {
  try {
    const home = await fetch(NSE, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
      },
      cache: "no-store",
    });

    const cookie = home.headers.get("set-cookie");
    if (!cookie) throw new Error("No cookie received");

    const api = await fetch(`${NSE}/api/allIndices`, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "application/json",
        Referer: "https://www.nseindia.com/",
        Cookie: cookie,
      },
      cache: "no-store",
    });

    if (!api.ok) {
      throw new Error("NSE blocked");
    }

    const data = await api.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "NSE blocked the request. Retry." },
      { status: 500 },
    );
  }
}
