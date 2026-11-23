# Licence wait-time reports

`reports.csv` holds wait times that applicants posted publicly on the Canadian Gun Nutz forum thread
"Shorten PAL approval times" (one row per report, with the page it came from). Reddit was not reachable when the data
was collected.

- **Days:** what the poster reported. `Measured` says from when to when: `to approval` (application sent to approved),
  `to card` (sent to card in hand) or `stated total` (the poster gave one number).
- **Precision:** `exact` when the poster gave dates or a day count, `approx` for "about two months" and similar.
- **Complication reported:** `Y` when the poster mentioned a problem (missing information, a returned form, a
  background check that took longer). The app shows these separately so one stuck file doesn't skew the typical wait.

These are self-reported and not a random sample. The app says so wherever it shows them. To add reports, append rows
with their source page and rebuild the content (`npm run content` in `app/`).
