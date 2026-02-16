import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const origin = req.headers.get("origin");

  const allowedOrigins = ["http://localhost:3000", "https://fii2.vercel.app"];

  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const res = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_AUTHOR_NAME}/${process.env.GITHUB_REPO_NAME}/actions/workflows/work.yml/dispatches`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          ref: "main",
        }),
      },
    );

    if (res.status === 204) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false }, { status: 500 });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
