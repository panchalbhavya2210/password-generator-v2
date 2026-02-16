"use server";

import { cookies } from "next/headers";

export async function setTheme(theme: string) {
  const cookieStore = await cookies();

  cookieStore.set("theme", theme, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

export async function setMode(mode: "light" | "dark") {
  const cookieStore = await cookies();
  cookieStore.set("mode", mode, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function setRadius(mode: "rounded" | "square") {
  const cookieStore = await cookies();
  cookieStore.set("theme-radius", mode, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
