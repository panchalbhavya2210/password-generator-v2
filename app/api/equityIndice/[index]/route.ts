import { NextRequest, NextResponse } from "next/server";

const NSE = "https://www.nseindia.com";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ index: string }> },
) {
  const { index } = await context.params;
  const indexName = decodeURIComponent(index);

  try {
    const home = await fetch(NSE, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "text/html",
      },
      cache: "no-store",
    });

    const cookie = home.headers.get("set-cookie");
    if (!cookie) throw new Error("No cookie");

    const api = await fetch(
      `${NSE}/api/equity-stockIndices?index=${encodeURIComponent(indexName)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          Accept: "application/json",
          Referer: "https://www.nseindia.com/",
          Cookie: cookie,
        },
        cache: "no-store",
      },
    );

    const data = await api.json();

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "NSE blocked" }, { status: 500 });
  }
}
