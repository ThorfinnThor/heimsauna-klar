# SelectYourSauna operations guide

**Version:** 1.0  
**Reviewed:** 16 September 2026
**Scope:** Static Cloudflare production and published US expansion

## Current operating model

The public site is generated from versioned JSON and Next.js routes. GitHub CI validates changes, Cloudflare Builds rebuilds the `main` branch, and Workers Static Assets serves the resulting files. The Awin workflows are manual dispatch jobs; there is no scheduled ingestion or hidden runtime updater.

The German and reviewed US routes are part of the static production output. The US release contains 27 published product pages and 221 research candidates that remain outside the public catalog.

## Routine checks

| Trigger | Required check | Owner | Result to record |
| --- | --- | --- | --- |
| Every repository change | GitHub CI, build, link, SEO, diversity and security gates | Sol role | Commit and CI run ID |
| Product or source change | Schema, source/evidence relation, dates and DE/US market separation | Luna, then Sol | Reviewed IDs and source dates |
| Affiliate-feed change | Sanitized candidate/sync diff, exact product mapping, current destination and package scope | Luna, then Sol | PR, advertiser and affected offer IDs |
| Program or rights change | Account evidence, permitted promotion types, feed/deeplink/image rights | Operator and Luna | Dated account or advertiser evidence |
| Legal/privacy change | Actual data flow, provider settings, mailbox and approved copy | Operator | Approval reference and effective date |
| Production release | Preflight, deployment IDs and complete smoke test | Sol with O-04 | Release record |
| Broken live behavior | Incident classification, rollback decision and verification | Operator and Sol | Incident and rollback record |

“No change” is a valid result only when a check was actually run. This document does not create a background monitoring service.

## Awin operating rules

- Keep `AWIN_FEED_LIST_URL` only in GitHub Secrets. Never paste it into repository files or build logs.
- Discovery and candidate workflows may commit sanitized reports. They do not activate products or offers.
- The sync workflow creates a review branch and pull request after its tests pass. Review the data diff before merging.
- A product link becomes affiliate-eligible only after exact product/configuration mapping, advertiser approval, allowed host and current tracking URL are documented.
- A feed failure must leave the last reviewed snapshot intact. It must not delete products or convert unknown availability into an offer.
- For US, `affiliate_links_enabled` is enabled for seventeen reviewed Sweat Kingdom offers. `feed_sync_enabled` remains `false`; every additional offer needs exact product mapping, current terms and a reviewed tracking URL before activation.

## Incident priorities

### P0: immediate rollback

Use the release runbook immediately for a site-wide outage, invalid TLS/canonical redirect, missing production assets, public secret, cross-market data leak, wrong index state across a market or broadly unsafe affiliate routing.

### P1: disable the affected surface

Use a reviewed kill-switch commit for an incorrect affiliate destination, expired program approval, unlicensed asset or US claim whose evidence no longer supports it. Disable the smallest safe scope. If the boundary is uncertain, disable the complete US route or affiliate surface.

### P2: normal correction

Use the standard pull-request and release flow for isolated copy, source-date, layout or noncommercial metadata defects that do not mislead users or expose protected data.

## Recovery evidence

Every material incident record should contain:

```text
detected_at_utc:
reported_by:
affected_urls:
affected_market:
severity:
release_commit:
cloudflare_deployment_id:
action_taken:
rollback_version_id:
verification:
root_cause:
follow_up_owner:
```

## Known open operations items

- Confirm real delivery to `info@selectyoursauna.com` with a sent and received message.
- Capture production Cloudflare version/deployment IDs from a host whose trust store accepts the current VPN/proxy certificate chain.
- Keep the recorded Sweat Kingdom Awin evidence current and obtain separate account evidence before activating Peak Saunas, Sunlighten, JNH Lifestyles or another advertiser.
- Resolve manufacturer image rights or keep US pages image-free.
- Run VoiceOver or NVDA, a physical small-screen check and production Cloudflare performance measurements for the authorized US release.
- The versioned review calendar is defined in `data/us/catalog-review-policy.json`; it becomes an active post-launch operating commitment only after S-24 and owner acceptance. Run `npm run us:catalog:review -- --as-of YYYY-MM-DD` for a reproducible report. The command never changes JSON or publication switches.

## References

- Release, deployment and rollback commands: `docs/us/release-runbook.md`
- Protected snapshot: `docs/us/launch-snapshot.json`
- Publication controls: `data/us/publication.json`
- Rights register: `docs/us/rights-register.json`
- Technical signoff: `docs/us/qa/sol-signoff.md`
