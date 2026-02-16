export type SectorRow = {
  Sector: string;
  "15D": number | "";
  "30D": number | "";
  "90D": number | "";
  "180D": number | "";
  "360D": number | "";
};

export type cdslResponse = {
  lastUpdated: string;
  latestStatement: string;
  sectors: SectorRow[];
};

const URL =
  "https://raw.githubusercontent.com/panchalbhavya2210/todo-fb/refs/heads/main/data/cdsl-data.json";

export async function getCDSLData(): Promise<cdslResponse> {
  const res = await fetch(URL, {
    cache: "no-cache",
  });

  if (!res.ok) {
    throw new Error("Failed To Fetch CDSL Data");
  }

  return res.json();
}
