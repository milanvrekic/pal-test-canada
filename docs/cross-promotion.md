# Cross-promotion to Huntable and Shootable

Follows the Moment Engine's site cross-promotion (10ten-command: `netlify/lib/promo.mts`, `public/siblings.js`,
`netlify/functions/xp.mts`). Code: `app/src/lib/handoff.ts` and `app/src/components/handoff-cards.tsx`.

## How it works

- The app reads `https://command.10tenstudio.com/xp/paltest.json` once per session (data only; no code is downloaded,
  which both stores forbid). If the feed says `enabled: false`, every card disappears without an app release. Lines,
  names and "In season" flags from the feed replace the built-in copy.
- Every tap goes through `/xp/go/paltest/<app>`: the Moment Engine counts the click, then sends phones to the store with
  `ct=xp-paltest` (Apple) or `utm_source=10ten-crosspromo` (Play), desktops to the website, and pre-launch apps
  (Shootable) to their waitlist site. Installs show up under **Growth → Installs by campaign** as `xp-paltest`.
- Until the Moment Engine knows the `paltest` site, or if the request fails, the app uses its built-in copy and links
  straight to the store with the same tags, so installs are still attributed.
- In-app event `handoff_click { destination, placement }` records where the tap happened (the redirect only knows the app).

## Where the cards appear

| Placement | Heading | When |
|---|---|---|
| `home` | After your course | Always, bottom of home. CRFSC shows Shootable first. |
| `exam_pass` | Passed? Here's what's next | Practice exam results, 80%+ |
| `exam_fail` | For when you pass | Practice exam results, under 80% |
| `practice_results` | After your course | Quick practice, topic and review results |
| `drill_results` | After your course | End of Spot the mistake |
| `guide` | After your course | End of every guide |
| `wait_times` | Get ready for when it arrives | Licence tracker, while waiting |
| `licence_arrived` | Now you're licensed | After "My licence arrived" |

## Needed in 10ten-command

Add `paltest` to `HOSTS` and `DEFAULT_PROMO.sites` (PR in milanvrekic/10ten-command). Shootable stays "Coming soon"
until its status there changes to `live`. When Shootable launches, nothing changes in this app.
