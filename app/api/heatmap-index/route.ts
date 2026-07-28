import { NextResponse } from "next/server";

const NSE = "https://www.nseindia.com";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "Broad Market Indices";

    const home = await fetch(NSE, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    const cookie = home.headers.get("set-cookie");
    if (!cookie) throw new Error("No cookie received");

    const res = await fetch(
      `${NSE}/api/heatmap-index?type=${encodeURIComponent(type)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          Accept: "application/json",
          Referer: "https://www.nseindia.com/",
          Cookie: cookie,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!res.ok) throw new Error(`NSE returned ${res.status}`);

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch heatmap data" },
      { status: 500 },
    );
  }
}
