import { NextResponse } from "next/server";
import { supabase } from "@/app/clients/supabaseClient";

export const revalidate = 86400; // 24 hours

export async function GET() {
  const pageSize = 1000;
  let from = 0;
  let allCompanies: any[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("companies")
      .select("symbol, name")
      .range(from, from + pageSize - 1);

    if (error) break;

    allCompanies = allCompanies.concat(data);

    // last page reached
    if (data.length < pageSize) break;

    from += pageSize;
  }

  return NextResponse.json({ companies: allCompanies });
}
