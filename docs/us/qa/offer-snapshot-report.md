# US offer freshness and snapshot QA

Date: 2026-09-14

## Result

The US offer path now has one 30-day freshness decision shared by affiliate links, visible prices and Finder budget comparisons. The public product component can display a stale record as `Check current price` without retaining its numeric price or an affiliate CTA. Unavailable, unknown, future-dated and invalid-dated offers are also blocked.

The current Product JSON-LD contains no `Offer` object, so it cannot expose a price outside this decision path.

The offer promotion command requires a successful and complete source result. It validates the full US bundle, rejects record removal and future successful-check dates, writes only the offer document through an atomic rename, and reports a recovery backup. Failed and partial attempts cannot replace the checked-in snapshot or update its successful-check dates.

## Verification

- `npm run us:test`: 97/97 passed
- `npm run lint`: passed
- `npm run build`: passed
- Static export: 587 routes generated before the disabled-US output gate
- US SEO crawl: 16 generated preview routes checked, 0 discoverable
- US output gate: passed; `out/us` removed
- DE link check: 568 HTML pages and 14,923 internal references, 0 broken targets
- DE SEO check: 565 pages, 306 indexable product pages and 210 noindex product pages
- Content diversity, security headers and discovery checks: passed

## Scope boundary

The checked-in US dataset still contains zero offers and all US publication switches remain disabled. Current behavior is therefore verified with isolated fixtures and the static preview build, not with a live US Awin feed or a production affiliate click.
