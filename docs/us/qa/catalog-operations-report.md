# L-16 catalog operations review

Date: 2026-09-14
Status: Process implemented for protected preview; production operating commitment remains after S-24.

## Implemented

- `data/us/catalog-review-policy.json` defines owners, review tracks, cadence and status rules.
- `scripts/us/review-catalog.mjs` produces a deterministic report for an explicit `--as-of` date and never mutates the repository.
- The review covers all ten current US pilot products, source references, source freshness, review dates, Awin relationship status, rights status and publication switches.
- `docs/us/catalog-operations.md` records the change workflow and escalation ownership.

## Actual check

`node --test scripts/us/catalog-review.test.mjs` passed three tests. The report for `2026-09-14` found ten candidate records awaiting their first review, zero stale sources, zero approved US publisher relationships, zero approved rights assets and protected publication switches. These findings are expected for the current research pilot and do not constitute a public-release approval.
