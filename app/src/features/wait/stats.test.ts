import assert from 'node:assert/strict';
import test from 'node:test';

import { daysBetween, isIsoDay, quantile, recent, shareDoneBy, summarize, typical, type WaitRow } from './stats.ts';

const row = (days: number, extra: Partial<WaitRow> = {}): WaitRow => ({
  date: '2026-06-01', province: 'BC', licence: 'PAL', application: 'new', method: 'online', days, measured: 'to card',
  complication: false, source: 'x', ...extra,
});

test('quantiles interpolate and round', () => {
  assert.equal(quantile([10, 20, 30, 40], 0.5), 25);
  assert.equal(quantile([10, 20, 30, 40, 50], 0.25), 20);
});

test('summaries need at least five reports', () => {
  assert.equal(summarize([row(1), row(2), row(3), row(4)]), null);
  assert.deepEqual(summarize([30, 40, 42, 60, 90].map((d) => row(d))), { n: 5, median: 42, p25: 40, p75: 60, min: 30, max: 90 });
});

test('typical drops renewals and complicated files', () => {
  const rows = [row(30), row(10, { application: 'renewal' }), row(300, { complication: true })];
  assert.deepEqual(typical(rows).map((r) => r.days), [30]);
});

test('recent falls back to every report when the last year is thin', () => {
  const rows = [row(30, { date: '2024-01-01' }), row(40, { date: '2026-10-01' })];
  assert.equal(recent(rows, '2026-11-22', 12, 2).window, 'all');
  assert.equal(recent(rows, '2026-11-22', 12, 1).rows.length, 1);
});

test('day maths', () => {
  assert.equal(daysBetween('2026-01-01', '2026-01-29'), 28);
  assert.equal(shareDoneBy([row(20), row(40)], 30), 0.5);
  assert.ok(isIsoDay('2026-02-28'));
  assert.ok(!isIsoDay('2026-2-28'));
});
