import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  try {
    const url = `${process.env.SUPABASE_URL}/rest/v1/rpc/get_sector_flow_tree`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY!}`,
      },

      cache: "force-cache",
    });

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error });
  }
}
