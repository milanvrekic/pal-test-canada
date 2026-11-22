// Pure wait-time statistics. No UI or storage imports, so it runs under node --test.

export type WaitRow = {
  date: string;
  province: string | null;
  licence: string | null;
  application: string | null;
  method: string | null;
  days: number;
  measured: string | null;
  complication: boolean;
  source: string;
};

export type WaitSummary = { n: number; median: number; p25: number; p75: number; min: number; max: number };

export const MIN_REPORTS = 5;
export const MINIMUM_WAIT_DAYS = 28;

export const PROVINCES: Record<string, string> = {
  BC: 'British Columbia',
  AB: 'Alberta',
  SK: 'Saskatchewan',
  MB: 'Manitoba',
  ON: 'Ontario',
  QC: 'Quebec',
  NB: 'New Brunswick',
  NS: 'Nova Scotia',
  PE: 'Prince Edward Island',
  NL: 'Newfoundland and Labrador',
  YT: 'Yukon',
  NT: 'Northwest Territories',
  NU: 'Nunavut',
};

/** Linear-interpolated quantile of sorted numbers (q from 0 to 1). */
export function quantile(sorted: readonly number[], q: number): number {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo));
}

export function summarize(rows: readonly WaitRow[]): WaitSummary | null {
  if (rows.length < MIN_REPORTS) return null;
  const d = rows.map((r) => r.days).sort((a, b) => a - b);
  return { n: d.length, median: quantile(d, 0.5), p25: quantile(d, 0.25), p75: quantile(d, 0.75), min: d[0], max: d[d.length - 1] };
}

/** New applications (not renewals) with no reported complication: the typical first-time wait. */
export const typical = (rows: readonly WaitRow[]) => rows.filter((r) => r.application !== 'renewal' && !r.complication);

/** Reports from the last `months` months before `asOf`, or every report when that leaves too few. */
export function recent(rows: readonly WaitRow[], asOf: string, months = 12, min = 20): { rows: WaitRow[]; window: 'recent' | 'all' } {
  const d = new Date(`${asOf}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - months);
  const cutoff = d.toISOString().slice(0, 10);
  const r = rows.filter((x) => x.date >= cutoff);
  return r.length >= min ? { rows: r, window: 'recent' } : { rows: rows.slice(), window: 'all' };
}

export const byProvince = (rows: readonly WaitRow[], code: string) => rows.filter((r) => r.province === code);
export const byMethod = (rows: readonly WaitRow[], method: 'online' | 'mail') => rows.filter((r) => r.method === method);

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
}

/** Share of reports that took no longer than `days` (0 to 1). */
export function shareDoneBy(rows: readonly WaitRow[], days: number): number {
  return rows.length ? rows.filter((r) => r.days <= days).length / rows.length : 0;
}

export const isIsoDay = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
