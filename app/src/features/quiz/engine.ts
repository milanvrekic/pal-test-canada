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

export function topicsFor(questions: readonly Question[], course: Course): string[] {
  return [...new Set(questions.filter((q) => q.course === course).map((q) => q.topic))].sort();
}

/** A practice set: questions never seen first, then the ones answered worst. */
export function buildPractice(
  questions: readonly Question[],
  progress: Progress,
  opts: { course: Course; topic?: string; size?: number; rng?: Rng },
): Question[] {
  const pool = questions.filter((q) => q.course === opts.course && (!opts.topic || q.topic === opts.topic));
  const accuracy = (q: Question) => {
    const a = progress.answers[q.id];
    return a && a.seen > 0 ? a.correct / a.seen : -1;
  };
  return shuffle(pool, opts.rng)
    .sort((a, b) => accuracy(a) - accuracy(b))
    .slice(0, opts.size ?? 10)
    .map((q) => shuffleOptions(q, opts.rng));
}

/** An exam: up to EXAM_SIZE questions spread across topics in proportion to the bank. */
export function buildExam(questions: readonly Question[], course: Course, rng: Rng = Math.random, size = EXAM_SIZE): Question[] {
  const pool = questions.filter((q) => q.course === course);
  if (pool.length <= size) return shuffle(pool, rng).map((q) => shuffleOptions(q, rng));
  const byTopic = new Map<string, Question[]>();
  for (const q of shuffle(pool, rng)) byTopic.set(q.topic, [...(byTopic.get(q.topic) ?? []), q]);
  const picked: Question[] = [];
  // Round-robin across topics keeps every topic represented.
  while (picked.length < size) {
    for (const list of byTopic.values()) {
      const q = list.pop();
      if (q) picked.push(q);
      if (picked.length === size) break;
    }
  }
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

export function recordExam(progress: Progress, exam: ExamRecord): Progress {
  return { ...progress, exams: [...progress.exams, exam] };
}

export function dueForReview(questions: readonly Question[], progress: Progress, course: Course, day: string): Question[] {
  return questions.filter((q) => {
    const a = progress.answers[q.id];
    return q.course === course && !!a?.due && a.due <= day;
  });
}

export type TopicStat = { topic: string; total: number; answered: number; seen: number; correct: number; accuracy: number | null };

export function topicStats(questions: readonly Question[], progress: Progress, course: Course): TopicStat[] {
  return topicsFor(questions, course).map((topic) => {
    const qs = questions.filter((q) => q.course === course && q.topic === topic);
    let seen = 0;
    let correct = 0;
    let answered = 0;
    for (const q of qs) {
      const a = progress.answers[q.id];
      if (a?.seen) {
        answered += 1;
        seen += a.seen;
        correct += a.correct;
      }
    }
    return { topic, total: qs.length, answered, seen, correct, accuracy: seen ? correct / seen : null };
  });
}

export function weakTopics(stats: readonly TopicStat[]): TopicStat[] {
  return stats
    .filter((s) => s.seen >= MIN_ANSWERS_FOR_TOPIC && s.accuracy !== null && s.accuracy < PASS_MARK)
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
};

export function topicLabel(topic: string): string {
  return TOPIC_LABELS[topic] ?? topic.charAt(0).toUpperCase() + topic.slice(1).replace(/-/g, ' ');
}
