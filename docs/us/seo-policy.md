# US SEO and discovery policy

Status: implemented behind the US publication controls on 2026-09-14.

## Indexing matrix

| Route class | Public requirement | Robots | Canonical | Sitemap |
| --- | --- | --- | --- | --- |
| US home and section overviews | US routes and indexing enabled, with published supporting content | `index, follow` | Self | Yes |
| Product detail | Product and at least one exact configuration published | `index, follow` | Self | Yes |
| Brand, guide and comparison detail | Parent content document and page published | `index, follow` | Self | Yes |
| Finder and future filter, sort or direct-compare states | Route may be public | `noindex, follow` | Self | No |
| Draft, candidate or reviewed-only record | Not a public search landing page | `noindex, follow` in research builds; removed from public output while routes are disabled | Self | No |
| Unknown dynamic slug | No generated static path | True 404 | None | No |

The implementation lives in `lib/us/seo.ts`. Sitemap and `llms.txt` consume the same published route set, so a draft cannot be added to discovery by a separate manual list.

## Canonical and language rules

- Every generated US page uses an absolute self-referential canonical under `/us/`.
- A US page is never canonicalized to a German page.
- `hreflang` is restricted to explicit, reviewed and reciprocal equivalence groups.
- The equivalence registry is intentionally empty until the L-14 editorial review confirms matching intent and content. Similar navigation labels or slugs are not sufficient evidence.
- The current review is recorded in `docs/us/qa/luna-seo-review.md` and `docs/us/seo-equivalence-matrix.json`; it approves no US/DE pair.

## Structured data

Published pages may emit the following source-backed types:

- `Organization`, `WebSite` and `WebPage` on the US home page.
- `BreadcrumbList` on approved detail pages.
- `Article` for approved brand and planning pages.
- `ItemList` for approved comparison pages.
- `Product` for an approved product and exact configuration.

Product schema contains only documented identity and technical properties. Ratings, reviews, GTIN values, merchant return policies, shipping details and offers are omitted unless a later reviewed data contract can support them. Research previews do not emit these blocks.

## Release controls

The checked-in publication file controls routes, indexing, affiliate links and feed sync independently. The current US release enables routes, indexing and the reviewed affiliate offer while feed sync remains disabled. Enabling routes alone does not enable indexing. Each page and underlying record must also satisfy its publication rule.
