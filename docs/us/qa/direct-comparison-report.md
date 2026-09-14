# S-26 direct model comparison verification

Date: 2026-09-14
Market: US protected research preview
Route: `/us/compare/models/`

## Result

The static comparison tool accepts two to four exact US configuration IDs, stores the ordered selection in repeated `model` URL parameters and rejects unknown, duplicate, cross-market or mismatched records. It does not create indexable combination pages and does not infer missing product facts.

## Automated checks

- All 10 pilot configurations appear exactly once.
- Product and configuration identities must resolve in the US market.
- URL input is allow-listed, de-duplicated and capped at four configurations.
- A three-configuration selection survives serialization and parsing without reordering.
- The protected preview contains 24 static `noindex, follow` US routes.
- The complete US CI run passes 110 tests, static SEO, security, accessibility and DE baseline checks.

## Browser checks

- The route rendered meaningful content without an error overlay.
- Selecting two configurations enabled the comparison action and produced a two-column fact table.
- Adding two more configurations disabled all remaining unchecked choices at the four-model limit.
- The resulting URL retained all four exact configuration IDs.
- Native checkboxes, buttons and product links were exposed in the accessibility tree.
- Keyboard focus on product links was visibly distinguishable.
- The four-model table remained contained in a horizontal overflow region at constrained widths.

## Remaining launch check

VoiceOver or NVDA and a physical small-screen device remain part of T-24 before public US launch. The feature remains protected by the existing US release switches in the meantime.
