import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dur = searchParams.get("dur") || "5d";

  const res = await fetch(
    `https://api.moneycontrol.com/mcapi/v1/sector/performance?dur=${dur}&type=top&section=industry&limit=5`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    },
  );

  const data = await res.json();
  return NextResponse.json(data);
}
