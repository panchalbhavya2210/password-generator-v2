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
      start: r.period_start,
      end: r.period_end,
      value: Number(r.net_investment_equity ?? 0),
    });
  }

  // CRITICAL: remove duplicate reporting blocks
  for (const sector in map) {
    const dedup = new Map<string, SectorPeriod>();

    for (const p of map[sector]) {
      dedup.set(p.end, p); // latest wins
    }

    map[sector] = Array.from(dedup.values()).sort((a, b) =>
      a.end.localeCompare(b.end),
    );
  }

  return map;
}

export function computeSnapshots(
  sectorMap: Record<string, SectorPeriod[]>,
): SectorSnapshot[] {
  // how many reporting blocks per window
  const WINDOW_PERIODS: Record<FlowWindow, number> = {
    15: 1,
    30: 2,
    90: 6,
    180: 12,
    365: 24,
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
      const needed = WINDOW_PERIODS[w];

      // take last N reporting periods
      const slice = periods.slice(-needed);

      let sum = 0;
      for (const p of slice) {
        sum += p.value;
      }

      flows[w] = Math.round(sum);
    }

    output.push({
      sector,
      lastStatement: latestDate,
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
