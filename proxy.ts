import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

export function proxy(req: NextRequest) {
  const cookie = req.cookies.get("site_auth")?.value;

  const expected = crypto
    .createHmac("sha256", process.env.AUTH_SECRET!)
    .update("authorized-user")
    .digest("hex");

  const isLoginPage = req.nextUrl.pathname.startsWith("/login");
  const isApi = req.nextUrl.pathname.startsWith("/api/login");

  // allow login page & api
  if (isLoginPage || isApi) {
    return NextResponse.next();
  }

  // if no cookie or invalid cookie → redirect to login
  if (!cookie || cookie !== expected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
