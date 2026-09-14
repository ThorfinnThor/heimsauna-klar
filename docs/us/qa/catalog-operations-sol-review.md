# Sol review of US catalog operations

Date: 2026-09-14
Status: Accepted for the protected US research catalog; public release remains blocked.

## Review result

The L-16 maintenance process is deterministic, read-only and compatible with the static export. It does not alter product JSON, publication switches or deployable output. The current report covers all ten US product candidates and keeps them outside public catalog resolution.

The technical review found and corrected three gaps before acceptance:

- every referenced product source is now checked independently, so one recent source cannot hide another stale source;
- reviewed records cannot schedule their next technical check beyond the 90-day policy cadence;
- report dates must be real ISO calendar dates, and missing or invalid source references remain explicit blockers.

Program approval and asset rights are reported as scoped restrictions. Missing program approval blocks affiliate output. Missing asset rights blocks manufacturer-image and feed-asset use. Neither state silently changes the catalog or enables publication.

## Evidence

- `node --test scripts/us/catalog-review.test.mjs`: 6/6 passed
- `npm run us:catalog:review -- --as-of 2026-09-14`: 10 products, 10 awaiting first review, 0 stale sources, 0 missing source references, 0 due reviews, 0 invalid schedules
- `npm run us:ci`: passed with the protected 24-page static preview and zero discoverable US routes
- `npm run build`: passed; DE baseline and public output remained unchanged
- GitHub CI: pending for the acceptance commit

## Remaining conditions

L-16 is accepted as a prepared operating process. The ten products still require the documented first technical review before promotion. S-24 remains dependent on explicit operator authorization, and US affiliate output and image use remain unavailable until their separate account and rights evidence exists.
