#!/usr/bin/env node
// Compiles content/questions/*.yaml and content/guides/*.md into one versioned
// JSON bundle at app/src/content/bundle.json.
//
//   node tools/compile-content.mjs                 release: fails on drafts or TBD
//   node tools/compile-content.mjs --allow-drafts  dev and deploy previews
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

function loadDrills() {
  const file = join(root, 'content', 'drills', 'spot-the-mistake.yaml');
  const list = YAML.parse(readFileSync(file, 'utf8')) ?? [];
  const out = [];
  const seen = new Set();
  for (const d of list) {
    const at = `spot-the-mistake.yaml:${d.id ?? '(no id)'}`;
    const bad = (msg) => errors.push(`${at} ${msg}`);
    if (!d.id || seen.has(d.id)) bad('missing or duplicate id');
    seen.add(d.id);
    if (!COURSES.includes(d.course)) bad(`course must be one of ${COURSES.join(', ')}`);
    if (!Array.isArray(d.options) || d.options.length < 2) bad('needs at least 2 options');
    if (!Number.isInteger(d.answer) || d.answer < 0 || d.answer >= (d.options?.length ?? 0)) bad('answer index out of range');
    if (!d.explanation) bad('missing explanation');
    // A photo (content/drills/photos/<scene>.jpg) wins over the SVG drawing when both exist.
    const photoPath = join(root, 'content', 'drills', 'photos', `${d.scene}.jpg`);
    const photo = existsSync(photoPath) ? d.scene : null;
    if (photo && !d.alt) bad('photo scenes need alt text (alt:)');
    let scene = '';
    try {
      scene = readFileSync(join(root, 'content', 'drills', 'scenes', `${d.scene}.svg`), 'utf8').trim();
    } catch {
      if (!photo) bad(`no scene: add content/drills/photos/${d.scene}.jpg or content/drills/scenes/${d.scene}.svg`);
    }
    const status = d.review?.status;
    if (!STATUSES.includes(status)) bad(`review.status must be one of ${STATUSES.join(', ')}`);
    if (status === 'retired') continue;
    const unfinished = [];
    if (status !== 'reviewed') unfinished.push('status is not reviewed');
    if (isTbd(d.source?.page)) unfinished.push('source.page is TBD');
    if (isTbd(d.review?.reviewed_by) || isTbd(d.review?.reviewed_on)) unfinished.push('review stamp is TBD');
    if ('law_checked_on' in d && isTbd(d.law_checked_on)) unfinished.push('law_checked_on is missing');
    if (unfinished.length) {
      if (!allowDrafts) bad(`not shippable: ${unfinished.join('; ')}`);
      else warnings.push(`${at} draft: ${unfinished.join('; ')}`);
    }
    out.push({
      id: d.id,
      course: d.course,
      question: d.question ?? 'What is wrong here?',
      options: d.options,
      answer: d.answer,
      explanation: d.explanation,
      source: { edition: isTbd(d.source?.handbook_edition) ? null : String(d.source.handbook_edition), section: d.source?.section ?? null, page: isTbd(d.source?.page) ? null : String(d.source.page) },
      scene: photo ? '' : scene,
      photo,
      alt: d.alt ?? null,
      draft: unfinished.length > 0,
    });
  }
  return out;
}

// Native apps can only bundle images through static require() calls, so copy the photos next to
// the bundle and generate the map (both gitignored).
function writeDrillPhotos(list) {
  const dir = join(root, 'app', 'src', 'content', 'drill-photos');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const lines = [];
  for (const d of list) {
    if (!d.photo) continue;
    copyFileSync(join(root, 'content', 'drills', 'photos', `${d.photo}.jpg`), join(dir, `${d.photo}.jpg`));
    lines.push(`  ${JSON.stringify(d.photo)}: require('./drill-photos/${d.photo}.jpg'),`);
  }
  writeFileSync(
    join(root, 'app', 'src', 'content', 'drill-photos.ts'),
    `// Generated by tools/compile-content.mjs. Do not edit.\nexport const drillPhotos: Record<string, number> = {\n${lines.join('\n')}\n};\n`,
  );
}

// Self-reported licence wait times (content/wait-times/README.md). Plain CSV: no field contains a comma.
function loadWaitTimes() {
  const file = join(root, 'content', 'wait-times', 'reports.csv');
  if (!existsSync(file)) return { rows: [] };
  const [head, ...lines] = readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const cols = head.split(',');
  const at = (r, name) => (r[cols.indexOf(name)] ?? '').trim();
  const rows = [];
  for (const [i, line] of lines.entries()) {
    const r = line.split(',');
    const days = Number(at(r, 'Days'));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(at(r, 'Report date')) || !Number.isFinite(days) || days <= 0) {
      errors.push(`wait-times/reports.csv line ${i + 2}: needs a report date and a positive day count`);
      continue;
    }
    rows.push({
      date: at(r, 'Report date'),
      province: at(r, 'Province') || null,
      licence: at(r, 'Licence') || null,
      application: at(r, 'Application') || null,
      method: at(r, 'Method') || null,
      days,
      measured: at(r, 'Measured') || null,
      complication: at(r, 'Complication reported') === 'Y',
      source: at(r, 'Source page'),
    });
  }
  return { rows };
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
      // Release builds leave unapproved guides out (they never ship) rather than failing the whole deploy.
      if (!allowDrafts) {
        warnings.push(`${file} left out of release: status is ${meta.status}`);
        continue;
      }
      warnings.push(`${file} draft guide`);
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

function loadCourses() {
  const dir = join(root, 'content', 'courses');
  const provinces = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort()) {
    const doc = YAML.parse(readFileSync(join(dir, file), 'utf8'));
    const regionIds = new Set((doc.regions ?? []).map((r) => r.id));
    const providers = [];
    for (const p of doc.providers ?? []) {
      const at = `${file} ${p.id}`;
      for (const k of ['id', 'name', 'regions', 'venues', 'courses', 'website', 'source', 'checked', 'status']) if (!p[k]) errors.push(`${at} missing ${k}`);
      for (const r of p.regions ?? []) if (!regionIds.has(r)) errors.push(`${at} unknown region ${r}`);
      if (p.status !== 'reviewed') {
        if (!allowDrafts) errors.push(`${at} not shippable: status is ${p.status}`);
        else warnings.push(`${at} draft listing`);
      }
      providers.push({
        id: p.id,
        name: p.name,
        regions: p.regions ?? [],
        venues: p.venues ?? [],
        courses: p.courses ?? [],
        website: p.website,
        phone: p.phone ?? null,
        email: p.email ?? null,
        source: p.source,
        checked: String(p.checked),
        draft: p.status !== 'reviewed',
      });
    }
    provinces.push({ province: doc.province, regions: doc.regions ?? [], providers: providers.sort((a, b) => a.name.localeCompare(b.name)) });
  }
  return provinces;
}

function loadPractical() {
  const file = join(root, 'content', 'practical', 'drills.yaml');
  const out = [];
  for (const d of YAML.parse(readFileSync(file, 'utf8')) ?? []) {
    const at = `practical ${d.id}`;
    for (const k of ['id', 'prompt', 'course', 'title', 'situation', 'steps', 'why', 'source', 'status']) if (!d[k]) errors.push(`${at} missing ${k}`);
    if ((d.steps ?? []).length < 3) errors.push(`${at} needs at least 3 steps`);
    if (d.status !== 'reviewed') {
      // Release builds leave unapproved drills out (they never ship) rather than failing the whole deploy.
      if (!allowDrafts) {
        warnings.push(`${at} left out of release: status is ${d.status}`);
        continue;
      }
      warnings.push(`${at} draft drill`);
    }
    out.push({
      id: d.id,
      course: d.course,
      title: d.title,
      prompt: d.prompt ?? d.situation,
      situation: d.situation,
      steps: d.steps,
      why: d.why,
      source: { edition: '2014 (5th ed.)', section: d.source?.section ?? null, page: d.source?.page ? String(d.source.page) : null },
      draft: d.status !== 'reviewed',
    });
  }
  return out;
}

const questions = loadQuestions();
const guides = loadGuides();
const drills = loadDrills();
const waitTimes = loadWaitTimes();
const courses = loadCourses();
const practical = loadPractical();
writeDrillPhotos(drills);

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

const body = { questions, guides, drills, waitTimes, courses, practical };
const version = createHash('sha256').update(JSON.stringify(body)).digest('hex').slice(0, 12);
const bundle = { version, builtAt: new Date().toISOString().slice(0, 10), containsDrafts: questions.some((q) => q.draft) || guides.some((g) => g.draft) || drills.some((d) => d.draft) || courses.some((c) => c.providers.some((p) => p.draft)) || practical.some((d) => d.draft), ...body };
const outDir = join(root, 'app', 'src', 'content');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'bundle.json'), JSON.stringify(bundle, null, 1) + '\n');
console.log(`Bundle ${version}: ${questions.length} questions (${COURSES.map((c) => `${c} ${questions.filter((q) => q.course === c).length}`).join(', ')}), ${guides.length} guides, ${drills.length} drills, ${courses.reduce((n, c) => n + c.providers.length, 0)} course listings, ${practical.length} practical drills, ${warnings.length} draft warning(s).`);
if (process.argv.includes('--verbose')) warnings.forEach((w) => console.log(`  warn: ${w}`));
