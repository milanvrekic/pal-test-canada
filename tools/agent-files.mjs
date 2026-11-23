#!/usr/bin/env node
// Makes the site easy for AI assistants and agents to read and cite. Runs after `expo export` (from postexport.mjs).
// - llms.txt: a short map of the site in the llmstxt.org format, linking plain markdown versions of each page.
// - llms-full.txt: every guide, the course directory and the wait-time summary in one markdown file.
// - Markdown copies: guides/<slug>.md, pal-courses.md, wait-times.md.
// - JSON-LD (schema.org) in the exported HTML: the site and app on the home page, Article on guides, the providers on
//   course pages, a Dataset on wait times, LearningResource on the practice tests.
// - A <link rel="alternate" type="text/markdown"> on each page that has a markdown copy.
// Everything comes from the same content bundle as the app, so release builds only ever describe approved content.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://paltest.ca'; // keep in step with SITE_URL in app/src/lib/content.ts
const NAME = 'PAL Test Canada';
const dist = process.argv[2] ?? 'dist';
const appDir = fileURLToPath(new URL('../app/', import.meta.url));
const bundle = JSON.parse(readFileSync(join(appDir, 'src/content/bundle.json'), 'utf8'));
const stats = await import(join(appDir, 'src/features/wait/stats.ts'));

const DISCLAIMER =
  'PAL Test Canada is an independent study aid. It is not affiliated with the RCMP, the Canadian Firearms Program or any course provider. ' +
  'Firearms law changes: check the RCMP Canadian Firearms Program for the current rules.';
const ABOUT =
  'Free, independent study aid for the Canadian Firearms Safety Course (CFSC) and the Canadian Restricted Firearms Safety Course (CRFSC), ' +
  'the courses you pass before applying for a Possession and Acquisition Licence (PAL or RPAL) in Canada. Every practice question cites ' +
  'a page of the 2014 CFSC or CRFSC student handbook and is checked by a certified instructor. No account, no ads.';

const abs = (md) => md.replace(/\]\((\/[^)\s]*)\)/g, (_, p) => `](${SITE}${p})`);
const guides = bundle.guides.filter((g) => !g.draft).sort((a, b) => a.order - b.order);
const bank = (course) => bundle.questions.filter((q) => q.course === course && !q.draft).length;
const PROV = stats.PROVINCES;

// ---------- markdown pages ----------

function guideMd(g) {
  return [
    `# ${g.title}`,
    '',
    `> ${g.description}`,
    '',
    `Source: ${SITE}/guides/${g.slug}${g.lastReviewed ? ` · Last reviewed ${g.lastReviewed}` : ''}`,
    '',
    abs(g.body.trim()),
    '',
    '---',
    DISCLAIMER,
    '',
  ].join('\n');
}

function coursesMd() {
  const out = ['# Where to take the PAL course (CFSC and CRFSC), by province', '', `Source: ${SITE}/pal-courses`, ''];
  for (const c of bundle.courses) {
    out.push(`## ${PROV[c.province] ?? c.province}`, '', `Page: ${SITE}/pal-courses/${c.province.toLowerCase()}`, '');
    if (c.intro) out.push(c.intro, '');
    for (const p of c.providers) {
      out.push(`### ${p.name}`);
      out.push(`- Courses: ${p.courses.map((k) => (k === 'cfsc' ? 'CFSC (non-restricted)' : 'CRFSC (restricted)')).join(', ')}`);
      out.push(`- Where: ${p.venues.map((v) => `${v.city} (${v.place})`).join('; ')}`);
      out.push(`- Website: ${p.website}`);
      if (p.phone) out.push(`- Phone: ${p.phone}`);
      if (p.email) out.push(`- Email: ${p.email}`);
      out.push(`- Checked: ${p.checked}`, '');
    }
  }
  out.push('Contact each provider for dates and prices. Listings are free.', '', '---', DISCLAIMER, '');
  return out.join('\n');
}

function waitSummary() {
  const rows = bundle.waitTimes?.rows ?? [];
  const asOf = bundle.builtAt.slice(0, 10);
  const { rows: pool, window } = stats.recent(stats.typical(rows), asOf);
  const national = stats.summarize(pool);
  // Same as the province pages: the last 12 months when there are enough reports, else every report for that province.
  const all = stats.typical(rows);
  const provinces = Object.keys(PROV)
    .map((code) => ({ code, s: stats.summarize(stats.byProvince(pool, code)) ?? stats.summarize(stats.byProvince(all, code)) }))
    .filter((x) => x.s);
  return { asOf, window, national, provinces, online: stats.summarize(stats.byMethod(pool, 'online')), mail: stats.summarize(stats.byMethod(pool, 'mail')) };
}

function waitMd(w) {
  const line = (label, s) => `- ${label}: typical ${s.median} days; half of reports between ${s.p25} and ${s.p75} days (${s.n} reports)`;
  const out = [
    '# PAL wait times: how long a new licence takes',
    '',
    `Source: ${SITE}/wait-times · Updated ${w.asOf}`,
    '',
    `New applications${w.window === 'recent' ? ', last 12 months' : ''}, from approval or card arrival as applicants reported it.`,
    '',
  ];
  if (w.national) out.push(line('All of Canada', w.national));
  if (w.online) out.push(line('Applied online', w.online));
  if (w.mail) out.push(line('Applied by mail', w.mail));
  out.push('', '## By province', '');
  for (const { code, s } of w.provinces) out.push(line(PROV[code], s));
  out.push(
    '',
    'These numbers are self-reported and not a random sample, so treat them as a rough guide. Renewals and files with a reported problem are left out of the typical wait.',
    '',
    '---',
    DISCLAIMER,
    '',
  );
  return out.join('\n');
}

// ---------- llms.txt ----------

function llmsTxt() {
  const g = guides.map((x) => `- [${x.title}](${SITE}/guides/${x.slug}.md): ${x.description}`);
  return [
    `# ${NAME}`,
    '',
    `> ${ABOUT}`,
    '',
    `Website: ${SITE}. ${DISCLAIMER}`,
    '',
    '## Guides',
    '',
    ...g,
    '',
    '## Course providers and wait times',
    '',
    `- [Where to take the PAL course, by province](${SITE}/pal-courses.md): who teaches the CFSC and CRFSC in ${bundle.courses.map((c) => PROV[c.province]).join(', ')}, with contact details`,
    `- [PAL wait times](${SITE}/wait-times.md): typical days from application to licence, nationally and by province`,
    '',
    '## Study tools (interactive pages)',
    '',
    `- [CFSC practice test](${SITE}/cfsc-practice-test): ${bank('cfsc')} questions with answers and handbook page references`,
    `- [CRFSC practice test](${SITE}/crfsc-practice-test): ${bank('crfsc')} restricted-course questions`,
    `- [Practical test trainer](${SITE}/practical): PROVE and safe-handling steps as flashcards`,
    `- [Storage and transport rules checker](${SITE}/rules)`,
    `- [Flashcards](${SITE}/flashcards)`,
    `- [PAL application checklist](${SITE}/apply)`,
    '',
    '## Optional',
    '',
    `- [Everything above in one file](${SITE}/llms-full.txt)`,
    `- [Sitemap](${SITE}/sitemap.xml)`,
    '',
  ].join('\n');
}

// ---------- JSON-LD ----------

const org = { '@type': 'Organization', '@id': `${SITE}/#org`, name: '10ten Studio', email: 'milan@10tenStudio.com' };
const website = { '@type': 'WebSite', '@id': `${SITE}/#site`, url: SITE, name: NAME, description: ABOUT, inLanguage: 'en-CA', publisher: { '@id': `${SITE}/#org` } };
const crumbs = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${path}` })),
});
const learning = (course, path, n) => ({
  '@type': 'LearningResource',
  name: `${course} practice test`,
  url: `${SITE}${path}`,
  learningResourceType: 'Practice quiz',
  educationalLevel: 'Beginner',
  isAccessibleForFree: true,
  inLanguage: 'en-CA',
  numberOfQuestions: n,
  teaches: course === 'CFSC' ? 'Canadian Firearms Safety Course content' : 'Canadian Restricted Firearms Safety Course content',
  publisher: { '@id': `${SITE}/#org` },
});

function ldFor(path, wait) {
  if (path === 'index.html')
    return [
      website,
      org,
      {
        '@type': 'WebApplication',
        name: NAME,
        url: SITE,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web, iOS, Android',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
        publisher: { '@id': `${SITE}/#org` },
      },
    ];
  if (path === 'cfsc-practice-test.html') return [learning('CFSC', '/cfsc-practice-test', bank('cfsc'))];
  if (path === 'crfsc-practice-test.html') return [learning('CRFSC', '/crfsc-practice-test', bank('crfsc'))];
  const gm = path.match(/^guides\/([^/[]+)\.html$/);
  if (gm) {
    const g = guides.find((x) => x.slug === gm[1]);
    if (!g) return [];
    return [
      {
        '@type': 'Article',
        headline: g.title,
        description: g.description,
        url: `${SITE}/guides/${g.slug}`,
        inLanguage: 'en-CA',
        ...(g.lastReviewed ? { dateModified: g.lastReviewed, lastReviewed: g.lastReviewed } : {}),
        publisher: { '@id': `${SITE}/#org` },
        isPartOf: { '@id': `${SITE}/#site` },
      },
      crumbs([['Guides', '/guides'], [g.title, `/guides/${g.slug}`]]),
    ];
  }
  const pm = path.match(/^pal-courses\/([a-z]{2})\.html$/);
  if (pm) {
    const c = bundle.courses.find((x) => x.province.toLowerCase() === pm[1]);
    if (!c) return [];
    const name = PROV[c.province] ?? c.province;
    return [
      {
        '@type': 'ItemList',
        name: `PAL course providers in ${name}`,
        itemListElement: c.providers.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'EducationalOrganization',
            name: p.name,
            url: p.website,
            ...(p.phone ? { telephone: p.phone } : {}),
            ...(p.email ? { email: p.email } : {}),
            areaServed: { '@type': 'AdministrativeArea', name },
          },
        })),
      },
      crumbs([['PAL courses', '/pal-courses'], [name, `/pal-courses/${pm[1]}`]]),
    ];
  }
  if (path === 'wait-times.html' || path === 'wait-times/index.html')
    return [
      {
        '@type': 'Dataset',
        name: 'PAL licence wait times in Canada',
        description:
          'Self-reported days from PAL application to approval or card arrival, summarized nationally and by province. Not a random sample.',
        url: `${SITE}/wait-times`,
        dateModified: wait.asOf,
        isAccessibleForFree: true,
        spatialCoverage: 'Canada',
        variableMeasured: 'Days from application to licence',
        distribution: { '@type': 'DataDownload', encodingFormat: 'text/markdown', contentUrl: `${SITE}/wait-times.md` },
        publisher: { '@id': `${SITE}/#org` },
      },
    ];
  return [];
}

const markdownFor = (path) => {
  const gm = path.match(/^guides\/([^/[]+)\.html$/);
  if (gm && guides.some((g) => g.slug === gm[1])) return `/guides/${gm[1]}.md`;
  if (path.startsWith('pal-courses/') || path === 'pal-courses.html') return '/pal-courses.md';
  if (path.startsWith('wait-times')) return '/wait-times.md';
  return null;
};

// ---------- write ----------

const wait = waitSummary();
for (const g of guides) writeFileSync(join(dist, 'guides', `${g.slug}.md`), guideMd(g));
writeFileSync(join(dist, 'pal-courses.md'), coursesMd());
writeFileSync(join(dist, 'wait-times.md'), waitMd(wait));
writeFileSync(join(dist, 'llms.txt'), llmsTxt());
writeFileSync(
  join(dist, 'llms-full.txt'),
  [`# ${NAME}`, '', `> ${ABOUT}`, '', ...guides.map(guideMd), coursesMd(), waitMd(wait)].join('\n'),
);

let tagged = 0;
const pages = [
  'index.html',
  'cfsc-practice-test.html',
  'crfsc-practice-test.html',
  ...guides.map((g) => `guides/${g.slug}.html`),
  ...bundle.courses.map((c) => `pal-courses/${c.province.toLowerCase()}.html`),
  'pal-courses/index.html',
  'wait-times/index.html',
  'wait-times.html',
  ...Object.keys(PROV).map((p) => `wait-times/${p.toLowerCase()}.html`),
];
for (const path of pages) {
  const file = join(dist, path);
  if (!existsSync(file)) continue;
  const ld = ldFor(path, wait);
  const md = markdownFor(path);
  let extra = '';
  if (ld.length)
    extra += `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': ld }).replace(/</g, '\\u003c')}</script>`;
  if (md) extra += `<link rel="alternate" type="text/markdown" href="${md}"/>`;
  if (!extra) continue;
  writeFileSync(file, readFileSync(file, 'utf8').replace('</head>', `${extra}</head>`));
  tagged++;
}
console.log(`agent files: llms.txt, llms-full.txt, ${guides.length + 2} markdown pages; structured data on ${tagged} pages`);
