// Pure quiz logic. No UI, storage or platform imports, so it runs under node --test.

export type Course = 'cfsc' | 'crfsc';

export type Question = {
  id: string;
  course: Course;
  topic: string;
  type: 'multiple-choice' | 'true-false';
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  source: { edition: string | null; section: string | null; page: string | null };
  lawSensitive: boolean;
  draft: boolean;
};

export type AnswerRecord = {
  seen: number;
  correct: number;
  /** Consecutive correct answers. Drives the review interval. */
  streak: number;
  /** ISO day (YYYY-MM-DD) the question is next due for review, or null once learned. */
  due: string | null;
};

export type ExamRecord = { course: Course; date: string; correct: number; total: number };

export type Progress = {
  answers: Record<string, AnswerRecord>;
  exams: ExamRecord[];
};

export const EXAM_SIZE = 50;
export const PASS_MARK = 0.8;
export const READY_MARK = 0.9;
export const READY_EXAMS = 3;
/** Days until a question comes back after 1, 2 and 3 correct answers in a row. */
export const REVIEW_INTERVALS = [1, 3, 7];
/** A topic is only called weak once this many of its questions have been answered. */
const MIN_ANSWERS_FOR_TOPIC = 3;

export const emptyProgress = (): Progress => ({ answers: {}, exams: [] });

export type Rng = () => number;

export function seededRng(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Options in a new order with the answer index following, so the correct answer has no usual position. */
export function shuffleOptions(q: Question, rng: Rng = Math.random): Question {
  if (q.type === 'true-false') return q;
  const order = shuffle(q.options.map((_, i) => i), rng);
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
}

export function addDays(day: string, days: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const today = (now: Date = new Date()): string =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

/**
 * Topics with only a question or two make one-question quizzes, so related ones share a practice group.
 * The YAML keeps its fine-grained topics (the content check keys law topics on them).
 */
const TOPIC_GROUPS: Record<string, string> = {
  storage: 'storage-transport-display',
  transport: 'storage-transport-display',
  display: 'storage-transport-display',
  classification: 'law-and-licensing',
  licensing: 'law-and-licensing',
  responsibilities: 'law-and-licensing',
  parts: 'parts-and-care',
  care: 'parts-and-care',
};

export const topicGroup = (topic: string): string => TOPIC_GROUPS[topic] ?? topic;

export function topicsFor(questions: readonly Question[], course: Course): string[] {
  return [...new Set(questions.filter((q) => q.course === course).map((q) => topicGroup(q.topic)))].sort();
}

/** A practice set: questions never seen first, then the ones answered worst. */
export function buildPractice(
  questions: readonly Question[],
  progress: Progress,
  opts: { course: Course; topic?: string; size?: number; rng?: Rng },
): Question[] {
  const pool = questions.filter((q) => q.course === opts.course && (!opts.topic || topicGroup(q.topic) === opts.topic));
  const accuracy = (q: Question) => {
    const a = progress.answers[q.id];
    return a && a.seen > 0 ? a.correct / a.seen : -1;
  };
  return shuffle(pool, opts.rng)
    .sort((a, b) => accuracy(a) - accuracy(b))
    .slice(0, opts.size ?? 10)
    .map((q) => shuffleOptions(q, opts.rng));
}

/**
 * How many questions each topic gets in an exam of `size`: its share of the bank, rounded by largest remainder, with
 * at least one per topic. A topic with 20 of 80 questions gets a quarter of the exam, not the same count as a topic
 * with 4, so small topics are not used up (and repeated word for word) in every exam.
 */
export function examQuotas(counts: ReadonlyMap<string, number>, size: number): Map<string, number> {
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  const shares = [...counts].map(([topic, n]) => ({ topic, n, exact: (size * n) / total }));
  const quota = new Map(shares.map((s) => [s.topic, Math.min(s.n, Math.max(1, Math.floor(s.exact)))]));
  const sum = () => [...quota.values()].reduce((a, b) => a + b, 0);
  // Hand out what rounding down left over, biggest remainder first.
  const byRemainder = [...shares].sort((a, b) => (b.exact % 1) - (a.exact % 1) || b.n - a.n);
  for (let i = 0; sum() < size && i < byRemainder.length * 2; i++) {
    const s = byRemainder[i % byRemainder.length];
    if ((quota.get(s.topic) ?? 0) < s.n) quota.set(s.topic, (quota.get(s.topic) ?? 0) + 1);
  }
  // The one-per-topic floor can overshoot when there are many tiny topics: take back from the biggest.
  while (sum() > size) {
    const [topic, n] = [...quota].sort((a, b) => b[1] - a[1])[0];
    quota.set(topic, n - 1);
  }
  return quota;
}

/** An exam: up to EXAM_SIZE questions, each topic represented in proportion to its share of the bank. */
export function buildExam(questions: readonly Question[], course: Course, rng: Rng = Math.random, size = EXAM_SIZE): Question[] {
  const pool = questions.filter((q) => q.course === course);
  if (pool.length <= size) return shuffle(pool, rng).map((q) => shuffleOptions(q, rng));
  const byTopic = new Map<string, Question[]>();
  for (const q of shuffle(pool, rng)) byTopic.set(topicGroup(q.topic), [...(byTopic.get(topicGroup(q.topic)) ?? []), q]);
  const quotas = examQuotas(new Map([...byTopic].map(([t, list]) => [t, list.length])), size);
  // Each topic's list is already shuffled, so the first few are a random draw from it.
  const picked = [...byTopic].flatMap(([t, list]) => list.slice(0, quotas.get(t) ?? 0));
  return shuffle(picked, rng).map((q) => shuffleOptions(q, rng));
}

export function recordAnswer(progress: Progress, questionId: string, wasCorrect: boolean, day: string): Progress {
  const prev = progress.answers[questionId] ?? { seen: 0, correct: 0, streak: 0, due: null };
  const streak = wasCorrect ? prev.streak + 1 : 0;
  // A wrong answer comes back tomorrow. A question enters review only once it has been missed.
  const inReview = !wasCorrect || prev.due !== null;
  let due: string | null = null;
  if (!wasCorrect) due = addDays(day, REVIEW_INTERVALS[0]);
  else if (inReview && streak <= REVIEW_INTERVALS.length - 1) due = addDays(day, REVIEW_INTERVALS[streak]);
  return {
    ...progress,
    answers: {
      ...progress.answers,
      [questionId]: { seen: prev.seen + 1, correct: prev.correct + (wasCorrect ? 1 : 0), streak, due },
    },
  };
}

/**
 * Flashcards are self-marked, so they never count as answers: "Got it" changes nothing, and "Again" only puts the card
 * into review for tomorrow. Topic scores and readiness come from questions that were actually answered.
 */
export function markForReview(progress: Progress, questionId: string, day: string): Progress {
  const prev = progress.answers[questionId] ?? { seen: 0, correct: 0, streak: 0, due: null };
  return { ...progress, answers: { ...progress.answers, [questionId]: { ...prev, streak: 0, due: addDays(day, REVIEW_INTERVALS[0]) } } };
}

export function recordExam(progress: Progress, exam: ExamRecord): Progress {
  return { ...progress, exams: [...progress.exams, exam] };
}

export function dueForReview(questions: readonly Question[], progress: Progress, course: Course, day: string): Question[] {
  return questions.filter((q) => {
    const a = progress.answers[q.id];
    return q.course === course && !!a?.due && a.due <= day;
  });
}

/**
 * `accuracy` is where the learner stands now: of the questions answered in the topic, the share whose latest answer was
 * right. It is not a lifetime average, so early mistakes stop counting once the question is answered correctly; with a
 * lifetime average, a few weak first exams kept topics "weak" through seven or more perfect ones.
 * `seen` and `correct` are still every answer ever given.
 */
export type TopicStat = { topic: string; total: number; answered: number; right: number; seen: number; correct: number; accuracy: number | null };

export function topicStats(questions: readonly Question[], progress: Progress, course: Course): TopicStat[] {
  return topicsFor(questions, course).map((topic) => {
    const qs = questions.filter((q) => q.course === course && topicGroup(q.topic) === topic);
    let seen = 0;
    let correct = 0;
    let answered = 0;
    let right = 0;
    for (const q of qs) {
      const a = progress.answers[q.id];
      if (a?.seen) {
        answered += 1;
        if (a.streak > 0) right += 1;
        seen += a.seen;
        correct += a.correct;
      }
    }
    return { topic, total: qs.length, answered, right, seen, correct, accuracy: answered ? right / answered : null };
  });
}

export function weakTopics(stats: readonly TopicStat[]): TopicStat[] {
  return stats
    .filter((s) => s.answered >= MIN_ANSWERS_FOR_TOPIC && s.accuracy !== null && s.accuracy < PASS_MARK)
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));
}

export const examScore = (e: ExamRecord): number => (e.total ? e.correct / e.total : 0);
export const examPassed = (e: ExamRecord): boolean => examScore(e) >= PASS_MARK;

export type Readiness = { ready: boolean; reasons: string[] };

/** Ready means: the last READY_EXAMS exams all at READY_MARK or better, and no weak topic. */
export function readiness(questions: readonly Question[], progress: Progress, course: Course): Readiness {
  const reasons: string[] = [];
  const exams = progress.exams.filter((e) => e.course === course);
  const recent = exams.slice(-READY_EXAMS);
  if (recent.length < READY_EXAMS) {
    reasons.push(`Take ${READY_EXAMS - recent.length} more practice exam${READY_EXAMS - recent.length === 1 ? '' : 's'}.`);
  } else if (!recent.every((e) => examScore(e) >= READY_MARK)) {
    reasons.push(`Score ${Math.round(READY_MARK * 100)}% or better on your last ${READY_EXAMS} practice exams.`);
  }
  for (const s of weakTopics(topicStats(questions, progress, course))) {
    reasons.push(`Bring ${topicLabel(s.topic)} up to ${Math.round(PASS_MARK * 100)}% (now ${Math.round((s.accuracy ?? 0) * 100)}%).`);
  }
  return { ready: reasons.length === 0, reasons };
}

const TOPIC_LABELS: Record<string, string> = {
  'vital-four-acts': 'The Vital Four ACTS',
  prove: 'PROVE',
  'range-and-field': 'Range and field',
  misfires: 'Misfires and hang fires',
  'shooting-technique': 'Shooting technique',
  care: 'Care and cleaning',
  'storage-transport-display': 'Storage, transport and display',
  'law-and-licensing': 'Classes, licences and the law',
  'parts-and-care': 'Parts and care',
};

export function topicLabel(topic: string): string {
  return TOPIC_LABELS[topic] ?? topic.charAt(0).toUpperCase() + topic.slice(1).replace(/-/g, ' ');
}
