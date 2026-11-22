# PAL Test Canada

Free practice tests and a licence tracker for Canadians getting their firearms licence (PAL/RPAL). Written and reviewed by a certified CFSC/CRFSC instructor. A 10ten Studio project.

- **Status:** Web MVP scaffolded with a 60-question draft sample. Content is unreviewed, so production builds are blocked.
- **Repo slug:** `pal-test-canada`
- **Purpose:** free funnel into Shootable and Huntable. It is not a revenue product.
- **Reviewer:** Milan (certified instructor).

## Why this exists

About 164,000 new PALs are issued a year. Every one of those people sits the CFSC exam, then waits 3 to 6 months for the licence, then asks "where can I shoot?" or "where can I hunt?". This project meets them at the first step and hands them to Shootable and Huntable at the last.

Existing prep apps are quiz-only, and the paid leader's recent reviews report correct answers marked wrong. Nobody covers what happens after the exam.

## Name and store metadata

"pal test" is the strongest keyword in the category on the Canadian App Store (popularity 87, difficulty 31), so the name leads with it. No existing app uses "PAL Test Canada" as its title.

| Field | Value | Length |
|---|---|---|
| Brand / web name | PAL Test Canada | |
| App Store title | PAL Test Canada: CFSC & CRFSC | 29 of 30 |
| App Store subtitle | RPAL practice exam & quiz prep | 30 of 30 |
| App Store keywords | firearms,licence,license,gun,safety,course,restricted,study,guide,acts,prove,possession,acquisition | 99 of 100 |
| Google Play title | PAL Test Canada: CFSC & CRFSC | 29 of 30 |
| Play short description | CFSC & CRFSC practice tests for your PAL. Reviewed by a certified instructor. | 77 of 80 |
| Domain (first choice) | paltest.ca (availability not checked) | |

Keyword scores, iOS Canada, 22 Nov 2026 (AppGazers, 0-100 relative scores):

| Keyword | Popularity | Difficulty | Covered by |
|---|---|---|---|
| pal test | 87 | 31 | title |
| pal practice test | 56 | 38 | title + subtitle |
| cfsc | 52 | 27 | title |
| crfsc | 45 | 22 | title |
| gun license test | 37 | 22 | keywords + title |
| pal test canada | 35 | 39 | title |
| pal exam | 34 | 20 | title + subtitle |
| cfsc practice test | 34 | 26 | title + subtitle |
| rpal | 33 | 20 | subtitle |
| firearms safety course | 33 | 17 | keywords |
| firearms licence | 31 | 20 | keywords |

On Google Play Canada, "cfsc" (100) and "rpal" (80) score highest, and both are in the title or subtitle.

Naming notes:
- "Canada" in the name can read as official. Every surface must say it is not affiliated with the RCMP or the Canadian Firearms Program.
- Do not put "free" or a year in the title or subtitle.
- The Play short description mentions the instructor. Confirm the designation can be used commercially before shipping it.

## Principles

1. **Free, no account, no ads.** Progress is stored on the device.
2. **Every question is verified.** Written from scratch, cited to a handbook page, reviewed by the instructor.
3. **Never reuse the real exam.** Questions come from the handbook only, never from memory of the official written or practical tests.
4. **Not a course.** It does not replace the mandatory instructor-led course, and says so.
5. **Fewer and correct beats more.** About 300 questions at launch.

## What makes it different

1. **Verified question bank** with handbook citations, one-tap "report an error" and a public changelog.
2. **Practical drills:** interactive step-ordering for ACTS and PROVE by action type, plus the automatic-fail mistakes.
3. **Licence tracker:** application checklist, timeline from "application received" through the 28-day minimum, reminders, common reasons applications get sent back.
4. **Hand-off:** when the user marks "licence arrived", show "Where can I legally shoot?" (Shootable) and "Where can I hunt?" (Huntable), using the "Also here" card rules.

## Phases

### Phase 0: gate (1-2 weeks, no build)
- [x] Certified instructor reviewer
- [ ] Confirm the instructor agreement allows publishing prep content and using the designation commercially
- [ ] Confirm the current handbook edition (latest found publicly: 2014, 5th edition)
- [ ] Confirm the official practical exam format (public sources disagree)
- [ ] Draft and review a 60-question sample (30 CFSC, 30 CRFSC)
- [ ] Decide home: standalone app (recommended) or a section inside Shootable
- [ ] Check domain and register it

### Phase 1: web MVP (2-3 weeks)
- [ ] Practice tests for CFSC and CRFSC
- [ ] Exam simulator (50 questions, 80% to pass)
- [ ] Weak-topic review
- [ ] About 300 verified questions
- [ ] "After the exam" guide pages, built for search
- [ ] Hand-off cards (Huntable live, Shootable "coming soon")
- [ ] Analytics without accounts: sessions, tests completed, hand-off clicks

### Phase 2: iOS and Android (3-4 weeks)
- [ ] Everything in Phase 1, offline
- [ ] Practical drills
- [ ] Licence tracker with local notifications
- [ ] Cross-app hand-off on "licence arrived"

### Phase 3: later
- [ ] French
- [ ] Province-specific next steps (hunter education, CFO contacts)

## Kill criteria

- The instructor agreement rules out publishing under the instructor's name: rethink before building.
- Web MVP has under 1,000 users in its first 60 days: stop before Phase 2.
- Hand-off click-through is under 5% after 90 days: keep the web tool, stop investing.

## Expected yield (assumptions, to be tested by the web MVP)

| Scenario | Prep users a year | 10ten installs driven |
|---|---|---|
| Low: performs like today's prep apps | 1,000-3,000 | 100-600 |
| Base: reaches 5% of new applicants | about 8,000 | 800-1,600 |
| High: reaches 10% | about 16,000 | 1,600-3,300 |

Shootable launches in BC and Alberta only, so early hand-off yield will sit below these numbers.

## Question format

One file per topic in `content/questions/`. Every question needs a citation and a review stamp before it ships.

```yaml
- id: cfsc-safety-001
  course: cfsc            # cfsc | crfsc
  topic: vital-four-acts
  type: multiple-choice   # multiple-choice | true-false
  question: "What does the C in ACTS stand for?"
  options:
    - "Check the chamber"
    - "Control the muzzle direction at all times"
    - "Clear the action"
    - "Carry the firearm unloaded"
  answer: 1               # zero-based index
  explanation: "ACTS: Assume every firearm is loaded, Control the muzzle direction at all times, Trigger finger off the trigger and out of the trigger guard, See that the firearm is unloaded."
  source:
    handbook_edition: TBD
    page: TBD
  review:
    reviewed_by: TBD
    reviewed_on: TBD
    status: draft         # draft | reviewed | retired
```

Rules:
- No question ships with `status: draft` or a `TBD` source.
- Law-dependent questions (storage, transport, classification) carry a `law_checked_on` date and are re-reviewed when regulations change.
- Wrong options must be plausible but clearly wrong to someone who read the handbook. No trick wording.

## Repository layout

```
pal-test-canada/
  README.md
  netlify.toml          # web build: strict in production, drafts allowed in previews
  content/
    questions/          # YAML question bank, one file per course or topic
    guides/             # guide pages (markdown with front matter)
    drills/             # practical drill definitions (Phase 2)
    CHANGELOG.md        # public content changelog
  tools/
    compile-content.mjs # validates content, writes app/src/content/bundle.json
  app/                  # Expo app: web now, iOS and Android in Phase 2
    src/app/            # routes: home, quiz, guides, about
    src/features/quiz/  # quiz engine (pure TypeScript) and its tests
    src/lib/            # content, progress storage, analytics, hand-off config
  store/                # titles, subtitles, keywords, screenshots
  docs/
    reviewing-content.md
    review-log.md
```

## Running it

```
cd app
npm install
npm run web                 # dev server, drafts allowed
npm test                    # quiz engine tests
npm run typecheck
npm run build:web:preview   # static site in app/dist, drafts allowed
npm run build:web           # production: fails while any content is a draft
```

Stack: Expo SDK 58 with Expo Router, static web export. Progress is stored on the device. There is no backend.

## Risks

- **Content liability:** a wrong answer on storage or transport law is worse than no answer.
- **Exam confidentiality:** see principle 3.
- **Copyright:** the handbook is Crown copyright. Write original questions, cite pages, link to the official PDF, do not embed it.
- **Law changes:** needs an owner and a visible "last reviewed" date.
- **App review:** keep content educational. No sales, modification or classification-workaround content.

## References

- Scope: 10ten Studio project doc `claude/pal-prep-funnel-scope.md`
- Handbook (2014, 5th ed.): https://publications.gc.ca/collections/collection_2015/grc-rcmp/PS99-2-2-1-2014-eng.pdf
- Paid leader: https://apps.apple.com/app/id1561709718
- Free web competitor: https://crfsc-practice-test.pages.dev/
- New PAL count: https://thegunblog.ca/2024/08/30/rcmp-2023-commissioner-of-firearms-report-data-highlights
- Licence timeline: https://silvercore-staging.vercel.app/blog/how-long-does-it-take-to-get-your-pal-in-canada
