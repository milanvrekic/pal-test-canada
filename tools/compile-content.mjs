#!/usr/bin/env node
// Compiles content/questions/*.yaml and content/guides/*.md into one versioned
// JSON bundle at app/src/content/bundle.json.
//
//   node tools/compile-content.mjs                 release: fails on drafts or TBD
//   node tools/compile-content.mjs --allow-drafts  dev and deploy previews
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'app', 'package.json'));
const YAML = require('yaml');

const allowDrafts = process.argv.includes('--allow-drafts');
const COURSES = ['cfsc', 'crfsc'];
const TYPES = ['multiple-choice', 'true-false'];
const STATUSES = ['draft', 'reviewed', 'retired'];
const LAW_TOPICS = ['storage', 'transport', 'classification', 'licensing', 'display'];
const EXAM_SIZE = 50;

const errors = [];
const warnings = [];
const isTbd = (v) => v === undefined || v === null || String(v).trim() === '' || String(v).trim().toUpperCase() === 'TBD';

function loadQuestions() {
  const dir = join(root, 'content', 'questions');
  const out = [];
  const seen = new Set();
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort()) {
    const list = YAML.parse(readFileSync(join(dir, file), 'utf8')) ?? [];
    for (const q of list) {
      const at = `${file}:${q.id ?? '(no id)'}`;
      const bad = (msg) => errors.push(`${at} ${msg}`);
      if (!q.id) bad('missing id');
      if (seen.has(q.id)) bad('duplicate id');
      seen.add(q.id);
      if (!COURSES.includes(q.course)) bad(`course must be one of ${COURSES.join(', ')}`);
      if (!q.topic) bad('missing topic');
      if (!TYPES.includes(q.type)) bad(`type must be one of ${TYPES.join(', ')}`);
      if (!q.question) bad('missing question');
      if (!Array.isArray(q.options) || q.options.length < 2) bad('needs at least 2 options');
      if (q.type === 'multiple-choice' && q.options?.length !== 4) bad('multiple-choice needs exactly 4 options');
      if (q.type === 'true-false' && q.options?.length !== 2) bad('true-false needs exactly 2 options');
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.options?.length ?? 0)) bad('answer index out of range');
      if (new Set(q.options ?? []).size !== (q.options ?? []).length) bad('duplicate options');
      if (!q.explanation) bad('missing explanation');
      const status = q.review?.status;
      if (!STATUSES.includes(status)) bad(`review.status must be one of ${STATUSES.join(', ')}`);
      if (status === 'retired') continue;

      const lawTopic = LAW_TOPICS.includes(q.topic) || q.law_sensitive === true;
      const unfinished = [];
      if (status !== 'reviewed') unfinished.push('status is not reviewed');
      if (isTbd(q.source?.handbook_edition)) unfinished.push('source.handbook_edition is TBD');
      if (isTbd(q.source?.page)) unfinished.push('source.page is TBD');
      if (isTbd(q.review?.reviewed_by)) unfinished.push('review.reviewed_by is TBD');
      if (isTbd(q.review?.reviewed_on)) unfinished.push('review.reviewed_on is TBD');
      if (lawTopic && isTbd(q.law_checked_on)) unfinished.push('law_checked_on is missing');
      if (unfinished.length) {
        if (!allowDrafts) bad(`not shippable: ${unfinished.join('; ')}`);
        else warnings.push(`${at} draft: ${unfinished.join('; ')}`);
      }
      out.push({
        id: q.id,
        course: q.course,
        topic: q.topic,
        type: q.type,
        question: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        source: {
          edition: isTbd(q.source?.handbook_edition) ? null : String(q.source.handbook_edition),
          section: q.source?.section ?? null,
          page: isTbd(q.source?.page) ? null : String(q.source.page),
        },
        lawSensitive: lawTopic,
        draft: unfinished.length > 0,
      });
    }
  }
  return out;
}

function loadGuides() {
  const dir = join(root, 'content', 'guides');
  const out = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    const raw = readFileSync(join(dir, file), 'utf8');
    const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) { errors.push(`${file} missing front matter`); continue; }
    const meta = YAML.parse(m[1]);
    for (const k of ['title', 'description', 'status']) if (!meta[k]) errors.push(`${file} front matter missing ${k}`);
    if (meta.status !== 'reviewed') {
      if (!allowDrafts) errors.push(`${file} not shippable: status is ${meta.status}`);
      else warnings.push(`${file} draft guide`);
    }
    out.push({
      slug: file.replace(/\.md$/, ''),
      title: meta.title,
      description: meta.description,
      order: meta.order ?? 99,
      lastReviewed: meta.last_reviewed ?? null,
      draft: meta.status !== 'reviewed',
      body: m[2].trim(),
    });
  }
  return out.sort((a, b) => a.order - b.order);
}

const questions = loadQuestions();
const guides = loadGuides();

for (const course of COURSES) {
  const n = questions.filter((q) => q.course === course).length;
  if (n < EXAM_SIZE) {
    const msg = `${course} has ${n} questions; a full exam needs ${EXAM_SIZE}`;
    if (allowDrafts) warnings.push(msg); else errors.push(msg);
  }
}

if (errors.length) {
  console.error(`Content check failed with ${errors.length} error(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

const body = { questions, guides };
const version = createHash('sha256').update(JSON.stringify(body)).digest('hex').slice(0, 12);
const bundle = { version, builtAt: new Date().toISOString().slice(0, 10), containsDrafts: questions.some((q) => q.draft) || guides.some((g) => g.draft), ...body };
const outDir = join(root, 'app', 'src', 'content');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'bundle.json'), JSON.stringify(bundle, null, 1) + '\n');
console.log(`Bundle ${version}: ${questions.length} questions (${COURSES.map((c) => `${c} ${questions.filter((q) => q.course === c).length}`).join(', ')}), ${guides.length} guides, ${warnings.length} draft warning(s).`);
if (process.argv.includes('--verbose')) warnings.forEach((w) => console.log(`  warn: ${w}`));
