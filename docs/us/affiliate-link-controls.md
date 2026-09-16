# US affiliate link controls

**Status:** implemented, active for seventeen reviewed offers
**Scope:** static US output only

## Output gate

`lib/us/affiliate.ts` is the only module that can turn a US offer into a clickable affiliate link. It returns a link only when all of the following are true:

- US routes and affiliate output are enabled in `data/us/publication.json`;
- `US_AFFILIATE_LINKS_DISABLED` is neither `1` nor `true` at build time;
- the US affiliate disclosure is non-empty and marked `published`;
- the product and its exact configuration are marked `published`;
- the offer is `eligible` and references the same active merchant and approved program;
- the selected placement is covered by the recorded promotion permissions;
- destination and tracking URLs use HTTPS and match their allowlists;
- an Awin link contains the approved advertiser ID and a publisher ID.

The environment variable is a one-way emergency switch. It can suppress links that JSON would otherwise allow, but it cannot activate links when a repository gate is closed.

## Rendering rules

External affiliate links use a native `a` element, so Next.js does not prefetch them. The resolver supplies `rel="sponsored nofollow noopener noreferrer"` and `target="_blank"`. It parses links only to validate them and returns the same normalized URL without replacing tracking or merchant-destination parameters.

The current repository contains seventeen reviewed US offers for Sweat Kingdom Saunas. Each corresponding product page exposes its own marked Awin deeplink; remaining research candidates continue to show `No reviewed offer`. Feed synchronization remains disabled, so additional offers require an exact feed or manual review.

## Activation procedure

1. Record a redacted `account-approval` source and the current program terms.
2. Mark the merchant active and the corresponding program approved, including confirmed promotion types and tracking hosts.
3. Add an offer that is mapped to the exact product configuration and validated against the approved program.
4. Publish the reviewed disclosure and product/configuration records.
5. Enable routes and affiliate output through a reviewed repository change.
6. Run `npm run us:test`, a research-preview build and the full production build before deployment.
7. Set `US_AFFILIATE_LINKS_DISABLED=1` and rebuild whenever all US affiliate links must be suppressed immediately.

The Sweat Kingdom account acceptance was confirmed by the site operator on 2026-09-16 and recorded with the advertiser profile and terms. No conversion or checkout test is claimed. Every Awin redirect is constructed for its exact reviewed product URL and is labelled before the visitor leaves the site.
