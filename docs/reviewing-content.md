# Reviewing content

Nothing ships to production until it is reviewed. The production build fails while any question or guide is a draft.

## Questions (`content/questions/*.yaml`)

For each question:

1. Check the question, every option, the answer index (zero-based) and the explanation against the handbook.
2. Fill `source.page` with the handbook page. Correct `source.section` if needed.
3. For storage, transport, display, classification and licensing questions, check the current regulations and set `law_checked_on` to the date you checked. The 2014 handbook predates later law changes.
4. Set the review stamp:

```yaml
review:
  reviewed_by: Milan
  reviewed_on: 2026-12-01
  status: reviewed      # or retired to drop the question
```

The sample files share one draft stamp through a YAML anchor (`&draft` / `*draft`). Replace `review: *draft` on each question you approve with its own stamp.

## Guides (`content/guides/*.md`)

Set `status: reviewed` and `last_reviewed` in the front matter once the text is checked.

## Checking your work

```
cd app
npm run content:preview   # lists nothing, builds a bundle that may include drafts
npm run content           # strict: fails and lists everything still unreviewed
```
