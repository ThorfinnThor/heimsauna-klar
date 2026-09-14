# US technical signoff

**Review date:** 14 September 2026  
**Ticket:** S-22  
**Technical decision:** Accepted with conditions for a public, non-indexed research beta

**Indexable/commercial launch decision:** No-go until the remaining external gates are complete

## Reviewed release state

The reviewed L-100 snapshot contains 100 unique US candidate products and 100 one-to-one configurations. It also contains 56 source records, 200 evidence records and 100 explicit image-rights records. No US merchant offer is published.

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
- The Finder now evaluates all 100 reviewed candidate records. Sol found that the former 16-record client limit hid valid 6-person, outdoor, 240 V configurations; a regression test now verifies all 100 records and the eleven documented voltage matches for that scenario. The direct-comparison selector remains bounded to 24 records.
- Public trust copy no longer presents the privacy notice as an internal repository draft.
- The Luna enrichment batch replaced collection-level placeholders with official model pages for Almost Heaven Hillsboro and four Redwood Outdoors models. The reviewed fields now include model dimensions and documented heater voltage, power and amperage where the manufacturer page states them. Unstated fields remain explicit unknowns.
- A second Luna enrichment batch added individual Redwood Outdoors pages for Grove, Horizon, Vista, Barrel and Barrel with Porch. Their exterior dimensions and included electric-heater values are now recorded against the matching product and configuration evidence; fields not stated on those pages remain explicit unknowns.
- The Sol live review found stale unknown-field explanations on those five Redwood pages that still referred to the collection page or a missing individual page. The explanations now refer to the reviewed model page and distinguish an unstated value from data that has not yet been normalized.
- The final Luna enrichment batch added the official Redwood Outdoors pages for Extra-Wide with Porch, Barrel 8 Person and Noctra 8 Person, plus the SaunaLife E8, E8W, E8G and CL7G model pages. Sol found that their pre-existing evidence IDs still pointed to the old collection records. The evidence now points to the exact model page and records the reviewed facts directly.
- SaunaLife CL7G publishes precise overview dimensions as well as rounded floor-plan dimensions. The catalog stores the precise overview values and the evidence records both presentations instead of silently hiding the difference.
- Redwood Outdoors states heater amperage but does not state a required branch-circuit rating on the reviewed product pages. Sol removed the inferred circuit values from all twelve affected Redwood configurations. The documented heater current remains visible, while a circuit-limited Finder search correctly asks for verification.
- A regression test now prevents the seven latest model records from reverting to collection-level evidence or stale “individual page required” explanations, and prevents Redwood heater amperage from being presented as a documented circuit requirement.
- The final browser review exposed misleading Finder copy for unknown facts. An undocumented seating capacity was described as though it were documented and too low. Finder explanations now distinguish missing capacity, placement, heat-type and product-type evidence from actual documented conflicts, with regression coverage for both outcomes.

## Verification result

| Area | Result |
| --- | --- |
| Static routing | 114 US routes generated, including the hub, catalog, 100 product pages, finder, comparison, editorial and trust pages |
| SEO and GEO safety | All US routes are `en-US`, self-canonical and `noindex, follow`; no US URL is present in sitemap or `llms.txt` |
| Data relationships | 100 products resolve one-to-one to 100 configurations; 200 evidence records and 56 sources resolve without warnings |
| Product and offer safety | Zero offers means no US price, availability, affiliate CTA or Product offer schema |
| Finder and comparison | The Finder deterministically evaluates all 100 records; the direct-comparison selector remains intentionally bounded to 24 records |
| Security and privacy | Static-assets-only Worker; no hidden third-party collection or tracked secret |
| DE regression | The German catalog, routes and affiliate behavior remain unchanged |
| Public build | 682 static HTML files and 15,602 internal references with zero broken internal targets |

## Commands executed

- `npm run us:test` — 123/123 passed
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
