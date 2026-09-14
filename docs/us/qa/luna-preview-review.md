# US editorial preview and usability review

**Review date:** 14 September 2026  
**Ticket:** L-12  
**Status:** Accepted with conditions  
**Scope:** Offline static preview generated from the current US launch snapshot.

## Expected and actual preview

The manifest expects 23 protected routes and the build produced exactly 23 HTML pages. The route groups are:

- home, catalog and finder: 3 routes
- ten candidate product pages: 10 routes
- comparison, brand and guide pages: 3 routes
- trust pages for contact, methodology, affiliate disclosure and privacy: 4 routes
- index shells for brands, compare and guides: 3 routes

Every generated page has `lang="en-US"`, a self-referential canonical and `noindex, follow`. None is in the sitemap or linked from the public DE output. The output gate removed `out/us` after the review, so the protected preview cannot be deployed accidentally.

## Editorial and data checks

| Area | Expected | Actual |
| --- | --- | --- |
| Product identity | Model, brand, placement and one matching configuration | All ten candidate products resolve to their own model/configuration/source record |
| Sources | Product pages show the source title and link | All ten product pages render their referenced official source titles |
| Offers and prices | No unverified commercial data in a zero-offer snapshot | All product pages show the explicit “No reviewed offer” state; no price, affiliate CTA or Product schema is emitted |
| Comparison scope | Eight documented indoor infrared configurations | The comparison is selected from eight indoor records; outdoor records stay outside that page |
| Finder behavior | Known matches remain separate from unresolved checks | The finder exposes the candidate set and preserves needs-verification states for unknown clearances/circuit facts |
| Trust content | English contact, methodology, disclosure and privacy drafts | Four routes render with `info@selectyoursauna.com`, the research method, affiliate boundary and privacy draft content |
| Copy limits | No hands-on, ranking, health, installation or availability claim without evidence | Preview copy contains the research limitation and leaves missing fields open |

The preview is structurally usable as a static research review. It is not a live checkout, affiliate test or production publication. No browser-device, screen-reader or real merchant-account transaction was inferred from this build; those checks remain release work in Sol's final QA and the operator gates.

## Findings and conditions

No blocking editorial mismatch was found in the current preview. The main visible limitation is intentional: the pages have no price or purchase destination because there are zero approved US offers. Product images are also intentionally absent because all ten rights records remain `not-requested`.

Before a public release, the following must be rechecked against the exact release snapshot:

1. English trust-page text must be approved by the operator/legal decision.
2. Any future offer must be matched to its exact configuration, current USD scope, destination and approved program relationship.
3. Image rights, shipping scope, minimum clearances and unresolved electrical fields must be documented before the affected claim is promoted.
4. Public indexing and the US publication switches must remain off until Luna's final recommendation and Sol's technical signoff are complete.

**Conclusion:** L-12 is accepted with conditions for the protected preview. The expected route count, language, source visibility, disclosure/contact coverage and no-offer behavior match the current snapshot. This is not a production go-live approval.
