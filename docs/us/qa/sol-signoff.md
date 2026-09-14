# US technical signoff

**Review date:** 14 September 2026  
**Ticket:** S-22  
**Technical decision:** Accepted with conditions for the protected research preview  
**Production decision:** No-go until the named operator, rights and release gates are complete

## Reviewed release state

The operator has added a mandatory catalog threshold for any later Sol acceptance: at least 100 unique US candidate products and 100 one-to-one configurations. The current protected state contains 10 of each, so this threshold is not met and no Sol acceptance may be recorded yet.

The review uses launch snapshot `us-protected-preview-2026-09-14-l10` and the repository state after Luna's L-11 and L-12 reviews. The protected scope contains ten candidate products, ten configurations, 20 source records, 20 evidence records and zero offers. All ten manufacturer-image entries remain `not-requested`.

The four publication controls are unchanged:

| Control | Current value | Technical consequence |
| --- | --- | --- |
| `routes_enabled` | `false` | The production output gate removes `/us/` |
| `indexing_enabled` | `false` | No US page enters sitemap or public discovery |
| `affiliate_links_enabled` | `false` | No US tracking destination or affiliate CTA can render |
| `feed_sync_enabled` | `false` | No unapproved US feed can modify the checked-in snapshot |

## Verification result

| Area | Result |
| --- | --- |
| Static routing | 23 protected US routes generated from the explicit preview manifest; every route is static HTML |
| SEO and GEO safety | All preview routes are `en-US`, self-canonical and `noindex, follow`; zero routes are discoverable and no unreviewed `hreflang` relation exists |
| Data relationships | Ten products resolve one-to-one to ten configurations; every documented fact has evidence and every source reference resolves |
| Product and offer safety | Candidate products cannot enter the public catalog; zero offers means no price, availability, affiliate CTA or Product offer schema |
| Affiliate controls | Publisher/program, merchant, market, tracking host, advertiser ID, freshness and publication gates fail closed |
| Finder | Hard criteria, unknown facts, exclusions, unit conversion, circuit options and budget scope remain deterministic |
| Security and privacy | Static-assets-only Worker, strict versioned headers, no third-party subresources or hidden client collection; tracked secrets are rejected |
| Accessibility baseline | One main and H1 per route, skip link, labels, focus visibility and reduced-motion rules pass the static preview checks |
| DE regression | 516 DE products, 306 indexable product pages, 210 noindex product pages, 18 merchants and 210 active affiliate offers remain unchanged |
| Public build | 568 static HTML files, 14,923 internal references and zero broken internal targets; US output removed before deployable output is finalized |

## Commands executed

- `npm run lint` — passed
- `npm run awin:test` — 10/10 passed
- `npm run offer:test` — 3/3 passed
- `npm run us:ci` — passed
- `npm run us:matrix:check` — 32/32 mapped; 22 automated, 8 partial and 2 manual cases retained honestly
- `npm run us:test` — 106/106 passed
- `npm run us:de-baseline:check` — passed
- `npm run us:preview:test` — 23/23 protected pages passed and `out/us` was removed
- `npm run build` — passed with all data, link, SEO, diversity, security and discovery gates

GitHub Actions run `34841198706` passed on the reviewed implementation and L-11/L-12 documentation state.

## Remaining production blockers

The following items are outside the completed repository-verifiable preview scope and must not be represented as green:

1. **O-02 / L-05 / L-13:** The actual US Awin publisher and advertiser relationships, allowed promotion types, feed/deeplink access, tracking hosts, exact offer mapping and image/feed rights are not documented. US offers remain empty.
2. **O-03 / S-18:** The English privacy, disclosure and contact drafts still need the explicit operator/legal decision before their status can become production-ready. Actual mailbox delivery also needs a real send/receive check.
3. **S-23:** The final release, rollback and operations runbook must reference the chosen release snapshot and be rehearsed.
4. **O-04 / S-24:** A concrete production scope must be authorized before any publication flag changes. The resulting release then needs an immediate live smoke test.
5. **Device checks:** VoiceOver or NVDA, a physical small-screen device and production Cloudflare performance remain named release checks. Static checks are not presented as substitutes.

## Recommendation

S-22 is accepted with conditions for the protected preview. There is no repository-level defect that requires reopening the implemented US architecture, snapshot, routing, SEO safeguards, finder or test matrix. The correct production decision is still **no-go** until the external account, rights, legal/operator and runbook gates above are complete.

This signoff does not enable a route, indexing, affiliate output or feed synchronization and is not an operator release authorization.
