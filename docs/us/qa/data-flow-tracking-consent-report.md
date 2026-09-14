# US data-flow, tracking and consent inventory review

Review date: 2026-09-14  
Scope: S-16  
Result: Technical inventory complete; legal and account-dashboard approval remains separate.

## Result

The public client is currently tracking-free. It contains no analytics SDK, advertising pixel, cookie write, browser storage, form submission, account flow or third-party embed. Catalog and Finder interactions run locally in React. Their state can appear in the URL, so a reload or newly opened filtered URL may include preference parameters in Cloudflare request handling and logs.

The active technical data flows are recorded in `docs/us/data-flow-inventory.json`:

- Cloudflare static delivery and request handling
- Cloudflare's Git-connected build and deployment process
- GitHub source control, CI and manually dispatched ingestion workflows
- server-side Awin product-feed ingestion inside GitHub Actions
- affiliate outbound clicks initiated by the visitor
- non-affiliate source and merchant links initiated by the visitor
- email contact initiated through the visitor's email client

Awin is not called when a page loads. It is reached only when a visitor deliberately opens a marked affiliate link. The current US dataset has no offer or live tracking destination, and all US publication switches remain disabled.

## Controls

The existing US route, indexing, feed and affiliate publication switches were confirmed. The emergency affiliate-output switch and global indexing override remain available. The checked-in Content Security Policy restricts scripts, images, fonts and browser connections to the same origin and blocks frames.

Four future features are explicitly recorded as disabled proposals: analytics, granular affiliate click references, a contact form and hosted preview authentication. They must not be introduced without documenting the provider, data fields, purpose, retention and required user controls.

## Automated evidence

- `npm run us:test`: 102/102 passed
- `npm run lint`: passed
- `npm run build`: passed
- US generated-page SEO crawl: 16/16 passed while 0 US routes remained discoverable
- DE regression: 568 HTML pages and 14,923 internal references with 0 broken targets
- DE catalog baseline unchanged at 516 products, including 306 indexable and 210 noindex product pages

The new drift tests fail if browser collection primitives, common analytics clients, third-party iframes, broader client egress, an unsanitized Awin workflow or a future collection control enabled by default appears in the checked scope.

## External checks still required

Repository code cannot establish Cloudflare request-log, Web Analytics, bot/security or retention settings; GitHub Actions log retention and account access; Awin reporting, attribution and transfer terms; or the mailbox routing destination and retention. These operator checks are listed in `docs/us/privacy-review-checklist.md`.

This report does not decide whether consent, an opt-out or particular legal wording is required. It provides the factual technical basis for that decision and prevents unverified compliance claims.
