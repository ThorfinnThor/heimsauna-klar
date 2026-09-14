# US technical signoff

**Review date:** 14 September 2026  
**Ticket:** S-22  
**Technical decision:** Accepted with conditions for a public, non-indexed research beta

**Indexable/commercial launch decision:** No-go until the remaining external gates are complete

## Reviewed release state

The reviewed L-100 snapshot contains 100 unique US candidate products and 100 one-to-one configurations. It also contains 44 source records, 200 evidence records and 100 explicit image-rights records. No US merchant offer is published.

The release opens the static US routes so the catalog can be inspected on the production domain. Search indexing, affiliate links and feed synchronization remain disabled. Candidate records are exposed only through this clearly labelled research-beta surface and are withheld from structured Product offer data.

| Control | Reviewed value | Technical consequence |
| --- | --- | --- |
| `routes_enabled` | `true` | The production export retains `/us/` |
| `indexing_enabled` | `false` | Every US route is `noindex, follow` and absent from sitemap and `llms.txt` |
| `affiliate_links_enabled` | `false` | No US tracking destination or affiliate CTA can render |
| `feed_sync_enabled` | `false` | No unapproved US feed can modify the checked-in snapshot |

## Sol findings and corrections

- Old homepage and comparison copy still described the original ten-record Peak/JNH pilot. It now describes the complete 100-record research set and states the uneven source depth honestly.
- Four source publishers were truncated to brand fragments. They now use the full publisher names.
- Static product generation originally depended only on the private preview switch. It now deliberately exposes all reviewed candidate records while indexing remains disabled.
- Finder and comparison payloads remain bounded to 16 and 24 records respectively. The catalog and product pages expose all 100 records without sending the entire catalog into each client component.
- Public trust copy no longer presents the privacy notice as an internal repository draft.
- The Luna enrichment batch replaced collection-level placeholders with official model pages for Almost Heaven Hillsboro and four Redwood Outdoors models. The reviewed fields now include model dimensions and default heater voltage, power and circuit values where the manufacturer page states them. Unstated fields remain explicit unknowns.

## Verification result

| Area | Result |
| --- | --- |
| Static routing | 114 US routes generated, including the hub, catalog, 100 product pages, finder, comparison, editorial and trust pages |
| SEO and GEO safety | All US routes are `en-US`, self-canonical and `noindex, follow`; no US URL is present in sitemap or `llms.txt` |
| Data relationships | 100 products resolve one-to-one to 100 configurations; 200 evidence records and 44 sources resolve without warnings |
| Product and offer safety | Zero offers means no US price, availability, affiliate CTA or Product offer schema |
| Finder and comparison | Deterministic filters are preserved; client payloads are intentionally bounded |
| Security and privacy | Static-assets-only Worker; no hidden third-party collection or tracked secret |
| DE regression | The German catalog, routes and affiliate behavior remain unchanged |
| Public build | 682 static HTML files and 15,602 internal references with zero broken internal targets |

## Commands executed

- `npm run us:test` — 118/118 passed
- `npm run us:ci` — passed, including all 114 US pages and noindex validation
- `npm run us:sol:gate` — 100/100 candidate products and configurations; ready for Sol review
- `npm run lint` — passed
- `npm run build` — passed with data, link, SEO, diversity, security and discovery gates

## Remaining indexable/commercial launch blockers

1. The US Awin publisher and advertiser relationships, allowed promotion types, feed or deeplink access, tracking hosts, exact offer mapping and image/feed rights are not documented. US offers remain empty.
2. A real mailbox send/receive test and the operator's final jurisdiction-specific legal review remain external checks.
3. Production Cloudflare performance, a physical small-screen device and VoiceOver or NVDA remain live acceptance checks.
4. Indexing, affiliate links and feed synchronization require separate reviewed releases. A successful beta build does not authorize any of those switches.

## Recommendation

The 100-record US catalog is technically accepted for a public, non-indexed research beta. The architecture, snapshot integrity, route isolation, finder safeguards and fail-closed commercial controls pass the Sol review. Search indexing and commercial activation remain no-go until their named gates are satisfied.
