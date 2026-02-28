import {
  DBSectorFlowRow,
  SectorPeriod,
  SectorSnapshot,
  FlowWindow,
  SectorTableRow,
} from "../types/net-investment";

export function parseDBRows(rows: DBSectorFlowRow[]) {
  const map: Record<string, SectorPeriod[]> = {};

  for (const r of rows) {
    if (!r.period_end) continue;

    if (!map[r.sector]) map[r.sector] = [];

    map[r.sector].push({
      start: new Date(r.period_start),
      end: new Date(r.period_end),
      value: Number(r.net_investment_equity ?? 0),
    });
  }

  for (const sector in map) {
    map[sector].sort((a, b) => a.end.getTime() - b.end.getTime());
  }

  return map;
}

export function computeSnapshots(
  sectorMap: Record<string, SectorPeriod[]>,
): SectorSnapshot[] {
  const WINDOWS: Record<FlowWindow, number> = {
    15: 15,
    30: 30,
    90: 90,
    180: 180,
    365: 365,
  };

  const output: SectorSnapshot[] = [];

  for (const sector in sectorMap) {
    const periods = sectorMap[sector];
    if (!periods || periods.length === 0) continue;

    const latestDate = periods[periods.length - 1].end;

    const flows: Record<FlowWindow, number> = {
      15: 0,
      30: 0,
      90: 0,
      180: 0,
      365: 0,
    };

    for (const w of [15, 30, 90, 180, 365] as FlowWindow[]) {
      const cutoff = new Date(latestDate);
      cutoff.setDate(cutoff.getDate() - WINDOWS[w]);

      let sum = 0;

      for (const p of periods) {
        if (p.end > cutoff) {
          sum += p.value;
        }
      }

      flows[w] = Math.round(sum);
    }

    output.push({
      sector,
      lastStatement: latestDate.toISOString(),
      flows,
    });
  }

  return output;
}

export function toTableRows(snapshots: SectorSnapshot[]): SectorTableRow[] {
  return snapshots
    .sort((a, b) =>
      a.sector.localeCompare(b.sector, "en", { sensitivity: "base" }),
    )
    .map((s) => ({
      sector: s.sector,
      last_statement: s.lastStatement,
      "15D": s.flows[15],
      "30D": s.flows[30],
      "90D": s.flows[90],
      "180D": s.flows[180],
      "365D": s.flows[365],
    }));
}
type RawSectorMap = Record<
  string,
  {
    period_start: string;
    period_end: string;
    net_investment_equity: number;
  }[]
>;

export function sectorMapToRows(map: RawSectorMap): DBSectorFlowRow[] {
  const rows: DBSectorFlowRow[] = [];

  for (const sector in map) {
    const periods = map[sector];

    for (const p of periods) {
      rows.push({
        sector,
        period_start: p.period_start,
        period_end: p.period_end,
        net_investment_equity: Number(p.net_investment_equity),
      });
    }
  }

  return rows;
}
