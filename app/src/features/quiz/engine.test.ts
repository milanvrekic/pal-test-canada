import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  type Question,
  addDays,
  buildExam,
  buildPractice,
  dueForReview,
  emptyProgress,
  readiness,
  recordAnswer,
  recordExam,
  seededRng,
  shuffleOptions,
  topicStats,
  weakTopics,
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
  assert.deepEqual(weak.map((w) => w.topic), ['storage']);
  assert.equal(weak[0].accuracy, 0.25);
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
