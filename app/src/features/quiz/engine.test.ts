import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  type Question,
  addDays,
  buildExam,
  buildPractice,
  examQuotas,
  dueForReview,
  emptyProgress,
  readiness,
  recordAnswer,
  recordDrill,
  recordSpot,
  recordExam,
  seededRng,
  shuffleOptions,
  markForReview,
  topicStats,
  weakTopics,
  topicGroup,
  topicsFor,
} from './engine.ts';

const make = (n: number, course: 'cfsc' | 'crfsc', topics: string[]): Question[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `${course}-${i}`,
    course,
    topic: topics[i % topics.length],
    type: 'multiple-choice',
    question: `Q${i}`,
    options: ['a', 'b', 'c', 'd'],
    answer: 0,
    explanation: 'x',
    source: { edition: null, section: null, page: null },
    lawSensitive: false,
    draft: false,
  }));

const bank = [...make(120, 'cfsc', ['acts', 'prove', 'storage', 'transport']), ...make(20, 'crfsc', ['storage'])];

test('exam has 50 unique questions from one course, every topic present', () => {
  const exam = buildExam(bank, 'cfsc', seededRng(1));
  assert.equal(exam.length, 50);
  assert.equal(new Set(exam.map((q) => q.id)).size, 50);
  assert.ok(exam.every((q) => q.course === 'cfsc'));
  assert.equal(new Set(exam.map((q) => q.topic)).size, 4);
});

test('exam gives each topic its share of the bank, and at least one question', () => {
  const counts = new Map([['big', 20], ['mid', 12], ['small', 4], ['tiny', 2], ['other', 44]]);
  const q = examQuotas(counts, 50);
  assert.equal([...q.values()].reduce((a, b) => a + b, 0), 50);
  assert.deepEqual(Object.fromEntries(q), { big: 12, mid: 7, small: 3, tiny: 1, other: 27 });
  // Many one-question topics: the floor of one each must not push the exam over its size.
  const many = examQuotas(new Map(Array.from({ length: 60 }, (_, i) => [`t${i}`, i === 0 ? 40 : 1] as [string, number])), 50);
  assert.equal([...many.values()].reduce((a, b) => a + b, 0), 50);
});

test('a small topic is not used up in every exam', () => {
  const uneven = [...make(76, 'cfsc', ['handling']), ...make(4, 'cfsc', ['misfires']).map((q, i) => ({ ...q, id: `m-${i}` }))];
  const seen = new Set<string>();
  for (let seed = 1; seed <= 20; seed++) {
    const picked = buildExam(uneven, 'cfsc', seededRng(seed)).filter((q) => q.topic === 'misfires');
    assert.ok(picked.length >= 1 && picked.length <= 3);
    picked.forEach((q) => seen.add(q.id));
  }
  assert.equal(seen.size, 4);
});

test('exam uses the whole bank when the bank is smaller than an exam', () => {
  assert.equal(buildExam(bank, 'crfsc', seededRng(1)).length, 20);
});

test('practice puts unseen questions before answered ones', () => {
  let p = emptyProgress();
  for (let i = 0; i < 100; i++) p = recordAnswer(p, `cfsc-${i}`, true, '2026-01-01');
  const set = buildPractice(bank, p, { course: 'cfsc', size: 10, rng: seededRng(2) });
  assert.ok(set.every((q) => Number(q.id.split('-')[1]) >= 100));
});

test('a missed question returns after 1, 3 then 7 days and then leaves review', () => {
  let p = recordAnswer(emptyProgress(), 'cfsc-0', false, '2026-01-01');
  assert.equal(p.answers['cfsc-0'].due, '2026-01-02');
  p = recordAnswer(p, 'cfsc-0', true, '2026-01-02');
  assert.equal(p.answers['cfsc-0'].due, addDays('2026-01-02', 3));
  p = recordAnswer(p, 'cfsc-0', true, '2026-01-05');
  assert.equal(p.answers['cfsc-0'].due, addDays('2026-01-05', 7));
  p = recordAnswer(p, 'cfsc-0', true, '2026-01-12');
  assert.equal(p.answers['cfsc-0'].due, null);
});

test('a question answered right first time never enters review', () => {
  const p = recordAnswer(emptyProgress(), 'cfsc-1', true, '2026-01-01');
  assert.equal(p.answers['cfsc-1'].due, null);
  assert.equal(dueForReview(bank, p, 'cfsc', '2026-12-31').length, 0);
});

test('due list only holds questions due on or before today', () => {
  const p = recordAnswer(emptyProgress(), 'cfsc-0', false, '2026-01-01');
  assert.equal(dueForReview(bank, p, 'cfsc', '2026-01-01').length, 0);
  assert.equal(dueForReview(bank, p, 'cfsc', '2026-01-02').length, 1);
});

test('weak topics need at least three answers and sit under 80%', () => {
  let p = emptyProgress();
  // storage is index 2 mod 4: answer 4 storage questions, 1 right.
  [2, 6, 10, 14].forEach((i, n) => (p = recordAnswer(p, `cfsc-${i}`, n === 0, '2026-01-01')));
  p = recordAnswer(p, 'cfsc-0', false, '2026-01-01'); // acts: one answer only, not enough to judge
  const weak = weakTopics(topicStats(bank, p, 'cfsc'));
  assert.deepEqual(weak.map((w) => w.topic), ['storage-transport-display']);
  assert.equal(weak[0].accuracy, 0.25);
});

test('a topic stops being weak once its questions are answered right again', () => {
  let p = emptyProgress();
  // Three rounds of wrong answers on four storage questions: a lifetime average would stay under 80% for a long time.
  for (const day of ['2026-01-01', '2026-01-02', '2026-01-03']) [2, 6, 10, 14].forEach((i) => (p = recordAnswer(p, `cfsc-${i}`, false, day)));
  assert.equal(weakTopics(topicStats(bank, p, 'cfsc')).length, 1);
  [2, 6, 10, 14].forEach((i) => (p = recordAnswer(p, `cfsc-${i}`, true, '2026-01-04')));
  const s = topicStats(bank, p, 'cfsc').find((t) => t.topic === 'storage-transport-display')!;
  assert.equal(s.accuracy, 1);
  assert.equal(s.seen, 16); // every answer is still counted
  assert.equal(s.correct, 4);
  assert.equal(weakTopics(topicStats(bank, p, 'cfsc')).length, 0);
});

test('flashcard "Again" schedules a review without counting as an answer', () => {
  const p = markForReview(emptyProgress(), 'cfsc-2', '2026-01-01');
  assert.equal(dueForReview(bank, p, 'cfsc', '2026-01-02').length, 1);
  const s = topicStats(bank, p, 'cfsc').find((t) => t.topic === 'storage-transport-display')!;
  assert.equal(s.answered, 0);
  assert.equal(s.accuracy, null);
  // An answered question keeps its counts when it is marked again.
  const q = markForReview(recordAnswer(emptyProgress(), 'cfsc-2', true, '2026-01-01'), 'cfsc-2', '2026-01-01');
  assert.deepEqual(q.answers['cfsc-2'], { seen: 1, correct: 1, streak: 0, due: '2026-01-02' });
});

test('thin topics share a practice group', () => {
  const qs = make(6, 'cfsc', ['storage', 'transport', 'display']);
  assert.deepEqual(topicsFor(qs, 'cfsc'), ['storage-transport-display']);
  assert.equal(buildPractice(qs, emptyProgress(), { course: 'cfsc', topic: 'storage-transport-display' }).length, 6);
  assert.equal(topicGroup('prove'), 'prove');
});

test('readiness needs three exams at 90% and no weak topic', () => {
  let p = emptyProgress();
  assert.equal(readiness(bank, p, 'cfsc').ready, false);
  for (const correct of [45, 46, 44]) p = recordExam(p, { course: 'cfsc', date: '2026-01-01', correct, total: 50 });
  assert.equal(readiness(bank, p, 'cfsc').ready, false); // 44/50 is 88%
  p = recordExam(p, { course: 'cfsc', date: '2026-01-02', correct: 47, total: 50 });
  p = recordExam(p, { course: 'cfsc', date: '2026-01-03', correct: 45, total: 50 });
  p = recordExam(p, { course: 'cfsc', date: '2026-01-04', correct: 50, total: 50 });
  assert.equal(readiness(bank, p, 'cfsc').ready, true);
  [2, 6, 10, 14].forEach((i) => (p = recordAnswer(p, `cfsc-${i}`, false, '2026-01-05')));
  const r = readiness(bank, p, 'cfsc');
  assert.equal(r.ready, false);
  assert.match(r.reasons[0], /Storage/);
});

test('readiness also needs clean practical drills and a passing Spot the mistake run', () => {
  let p = emptyProgress();
  for (const correct of [47, 45, 50]) p = recordExam(p, { course: 'cfsc', date: '2026-01-01', correct, total: 50 });
  const handling = {
    drills: [
      { id: 'prove', course: 'cfsc' as const, title: 'PROVE' },
      { id: 'fence', course: 'cfsc' as const, title: 'Crossing a fence' },
      { id: 'pistol', course: 'crfsc' as const, title: 'Unloading a pistol' },
    ],
    spotScenes: 10,
  };
  assert.equal(readiness(bank, p, 'cfsc').ready, true); // without the handling side, as before
  let r = readiness(bank, p, 'cfsc', handling);
  assert.equal(r.ready, false);
  assert.equal(r.writtenReady, true);
  assert.deepEqual(r.drillsLeft, ['prove', 'fence']); // the restricted drill belongs to the other course
  assert.equal(r.spotLeft, true);
  p = recordDrill(p, 'prove', true);
  p = recordDrill(p, 'fence', false); // a wrong pick: not clean yet
  p = recordSpot(p, 7, 10, '2026-01-02');
  r = readiness(bank, p, 'cfsc', handling);
  assert.deepEqual(r.drillsLeft, ['fence']);
  assert.match(r.reasons.join(' '), /Crossing a fence/);
  assert.match(r.reasons.join(' '), /7 of 10/);
  p = recordSpot(recordDrill(p, 'fence', true), 8, 10, '2026-01-03');
  assert.deepEqual(p.drills!.fence, { runs: 2, clean: 1, lastClean: true });
  assert.equal(readiness(bank, p, 'cfsc', handling).ready, true);
});

test('shuffled options keep the same correct answer text and move it around', () => {
  const q = { ...bank[0], options: ['right', 'w1', 'w2', 'w3'], answer: 0 };
  const positions = new Set<number>();
  for (let seed = 1; seed <= 40; seed++) {
    const s = shuffleOptions(q, seededRng(seed));
    assert.equal(s.options[s.answer], 'right');
    assert.deepEqual([...s.options].sort(), ['right', 'w1', 'w2', 'w3']);
    positions.add(s.answer);
  }
  assert.equal(positions.size, 4);
  const tf = { ...bank[0], type: 'true-false' as const, options: ['True', 'False'], answer: 1 };
  assert.deepEqual(shuffleOptions(tf, seededRng(3)).options, ['True', 'False']);
});
