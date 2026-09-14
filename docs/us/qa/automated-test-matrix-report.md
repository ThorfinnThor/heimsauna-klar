# US automated test matrix and DE regression report

Review date: 2026-09-14  
Scope: S-20 protected US pilot  
Status: Repository-verifiable acceptance complete; named account, rights and physical-device checks remain release work.

## Matrix result

`docs/us/qa/test-matrix.json` maps every required case from T-01 through T-32 to its executable repository evidence. `npm run us:matrix:check` fails when an ID is missing, duplicated or out of order, when an evidence path no longer exists, or when a partial/manual case hides its remaining check.

The current split is:

- 22 automated cases;
- 8 partially automated cases with the remaining real-data or device check stated explicitly;
- 2 manual cases covering actual contact delivery and the editorial rights/claims sign-off.

Partial does not mean passed. T-11, T-12, T-14, T-15, T-19, T-23, T-24 and T-32 retain a concrete launch check. T-29 and T-31 remain manual. These limits are recorded in the machine-readable matrix rather than being converted into false green results.

## Additional boundary coverage

S-20 added three focused regression cases:

1. Measurements in centimeters, millimeters and feet are converted before the room-fit comparison. Exact converted boundaries pass, while a room that is 0.001 inch too small remains excluded.
2. Two merchant offers for the same configuration retain separate package scopes and separate affiliate destinations.
3. A certification ID scoped to a heater or component cannot appear as a whole-product certification claim in Product JSON-LD.

The first case exposed a floating-point defect. A depth of 1219.2 mm could evaluate slightly above exactly 48 inches and be rejected. The Finder now applies a `1e-9` inch arithmetic tolerance only to conversion noise. It does not round a materially undersized room into a match.

The protected static crawl also rejects executable or embedded-data URLs in `href`, `src` or `action` attributes. Existing host allowlists, URL-state bounds, secret scans, CSP checks and the absence of public-client fetches cover the other repository-verifiable portions of T-25.

## CI and fixture safety

The main GitHub CI now runs `npm run us:ci` before the normal production build. That command validates the matrix, executes the complete US test suite, verifies the frozen DE baseline and builds/crawls the protected US preview. The normal production build then proves that the US output gate removes every disabled US route and discovery reference.

No feed credential is needed for these tests. Synthetic products, offers and merchants use explicit fixture identities and temporary directories. The protected preview separately crawls the six real candidate records and fails if a synthetic fixture marker reaches generated HTML.

## Actual execution

The following commands passed on 2026-09-14:

| Command | Result |
| --- | --- |
| `npm run us:matrix:check` | 32/32 cases mapped; 22 automated, 8 partial, 2 manual |
| `npm run us:test` | 106/106 tests passed |
| `npm run us:de-baseline:check` | 516 DE products, 306 indexable pages, 18 merchants and 210 active affiliate offers unchanged |
| `npm run lint` | passed |
| `npm run us:preview:test` | 19/19 static US pages passed; 6 candidate products, 0 offers, 0 fixture leaks, all pages noindex |
| `npm run build` | passed; 568 public HTML files, 14,923 DE internal references, 0 broken targets |

The production build retained 306 indexable and 210 noindex DE product pages. The US switches for routes, indexing, affiliate links and feed sync remained disabled, and `out/us` was removed before completion.

## Remaining release checks

- Exercise actual timeout/rate-limit behavior after a US feed connector exists.
- Review real offer-package separation, certification scope, retirement alternatives and mobile disclosure after launch records exist.
- Verify `info@selectyoursauna.com` by sending and receiving a real correction request.
- Run VoiceOver or NVDA and a physical small-screen device.
- Complete Luna's source, health-claim, test-claim, origin and image-rights review.
- Repeat the documented release/revert dry run against the final launch commit.

These items belong to their data, account or final-release gates. They do not justify enabling any US publication switch now.
