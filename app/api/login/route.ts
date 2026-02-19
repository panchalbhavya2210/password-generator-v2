import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const { user, pass } = await req.json();

  if (
    user === process.env.SITE_USERNAME &&
    pass === process.env.SITE_PASSWORD
  ) {
    // Create signed token
    const token = crypto
      .createHmac("sha256", process.env.AUTH_SECRET!)
      .update("authorized-user")
      .digest("hex");

    const res = NextResponse.json({ success: true });

    res.cookies.set("site_auth", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return res;
  }

  return new NextResponse("Unauthorized", { status: 401 });
}
