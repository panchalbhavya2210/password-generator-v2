// ---------- RAW DATABASE ROW ----------
export interface DBSectorFlowRow {
  sector: string;
  period_start: string;
  period_end: string;
  net_investment_equity: number;
}

// ---------- PARSED PERIOD ----------
export interface SectorPeriod {
  start: Date;
  end: Date;
  value: number;
}

// ---------- SNAPSHOT (CALCULATED WINDOWS) ----------
export type FlowWindow = 15 | 30 | 90 | 180 | 365;

export interface SectorSnapshot {
  sector: string;
  lastStatement: string;
  flows: Record<FlowWindow, number>;
}

// ---------- TABLE DATA ----------
export interface SectorTableRow {
  sector: string;
  last_statement: string;
  "15D": number;
  "30D": number;
  "90D": number;
  "180D": number;
  "365D": number;
}
