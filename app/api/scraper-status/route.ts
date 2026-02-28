import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_AUTHOR_NAME}/${process.env.GITHUB_REPO_NAME}/actions/runs?per_page=1`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    },
  );

  const data = await res.json();
  const run = data.workflow_runs?.[0];

  if (!run) {
    return NextResponse.json({ status: "unknown" });
  }

  return NextResponse.json({
    status: run.status,
    conclusion: run.conclusion,
  });
}
