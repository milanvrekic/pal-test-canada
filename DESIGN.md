# PAL Test Canada design system

Look: official and trustworthy, but clearly an **independent** study aid. The inspiration is the Canada Soccer rebrand: red, charcoal, white and a bold, wide wordmark. The friendly quiz layer comes from soft cards, pastel topic tiles and pill buttons.

## Never imply government affiliation
- No maple leaf, flag, coat of arms or "Government of Canada" style mark. The logo is a red rounded square with a white check, next to the "PAL Test Canada" wordmark.
- Don't use the Canada.ca look: no Lato or Noto Sans headings, no federal blue links, no black-and-white federal identity bar.
- "Independent study aid" sits under the wordmark. The disclaimer stays in the footer. Pages that mention the RCMP or CFP say "not affiliated" near the top.

## Tokens (`app/src/constants/theme.ts`)
| Role | Light | Use |
| --- | --- | --- |
| `signal` | `#C8281E` Canadian red | Brand mark, eyebrows, links, progress, and the single main action per screen (Start exam, Start tracking) |
| `accent` | `#2B2B2F` charcoal | Structure: Next/Finish buttons, selected states (course picker, selected answer) |
| `cover` | `#232326` | Dark stat panels (readiness, results) |
| `background` / `backgroundElement` | `#F6F6F4` / `#FFFFFF` | Canvas / cards |
| `tint*` | red, blue, green, sand, lilac | Topic tiles and stat bands, rotated in that order |
| `success` / `danger` | `#1D7542` / `#B3261E` | Answer feedback only |

Red marks the brand and the main action. It is never used for a selected state, because danger red already means "wrong".

## Type
- Headings and numbers: **Archivo Expanded** (Archivo at width 125). ExtraBold is used for title and stat, Bold for heading. The static files are in `app/assets/fonts` and `app/public/fonts`, licensed under the OFL.
- Body and question text: the platform font, 16/24. Questions are 21/29 semibold, and guide paragraphs are 17/28.
- Eyebrows: 12px, uppercase, letter-spaced 1.2.

## Shape and space
- Radius: cards 20, controls and answer rows 14, buttons are pills (999).
- Cards are white with a soft `Shadow` and no border. Spacing steps are 4/8/16/24/32/64.
- Layout: reading pages are 720 wide. Home, drills and wait times use 1120 with `Split`/`Col`, which is pure flex wrapping, so pages render the same on the server.
- Quiz and drills pin Next in `Screen bottomBar` and hide the footer.

## Components (`app/src/components`)
- `ui.tsx`:
  - `Screen` (width reading or wide, `bottomBar`), `Split`, `Col`
  - `Card`, `LinkCard`, `Eyebrow`, `Notice`
  - `Button`, with variants `signal`, `primary` and `secondary`
  - `ProgressBar`, `Ring`
- `answer.tsx`: `AnswerOption` (letter chip, then ✓ or ✕ plus a text note after answering), `Feedback` (coloured left edge plus a Source chip), and `sourceLine()`, which is the single citation format.
- With `Link asChild`, pass a flattened style object, never an array, because Slot drops arrays.
