# Sol review — Finnleo Euro Outdoor depth batch

**Review date:** 2026-09-24  
**Decision:** Accepted after schema correction  
**Publication decision:** Keep all three records as candidates

## Scope reviewed

- Finnleo Euro 4 × 6
- Finnleo Euro 5 × 6
- Finnleo Euro 5 × 7
- Canonical product, configuration and source records
- Coverage matrix, indexing plan and launch snapshot
- Reproducible enrichment script and Luna handoff report

## Finding corrected

The first Luna pass represented the floor, roof kit and accessory with component types that are not part of the canonical US schema, and used `optional` as an inclusion value. The accepted representation now uses the supported `other` component type. The optional roof kit is named explicitly and marked `excluded`, matching the existing convention for a purchasable option that is not included in the documented base configuration.

## Evidence assessment

The three normalized records are supported by exact Finnleo model pages. Their overall dimensions, outdoor placement and finish options are stated directly. The Euro 4 × 6 page gives one capacity value and can therefore carry a normalized seated-capacity value of two. The 5 × 6 and 5 × 7 pages give a range of two to three people; the schema only accepts one integer, so both normalized capacity fields remain unknown with the source range recorded in the reason and evidence.

No model-specific voltage, heater package, current, rated power or circuit requirement was inferred. The three records therefore remain outside the strict publication gate. The 6 × 8 and two changing-room pages remain held because their page titles, descriptive size labels and published dimension rows do not align sufficiently for safe normalization.

## Verification result

- US data validation: **passed**, 290 products, 290 configurations, 17 offers, 0 warnings.
- Launch snapshot: **passed**, 71 published products and 219 candidates.
- US indexing readiness: **passed**, 10/10 first-wave products technically qualified and 0 release gates open.
- Candidate audit: **passed as an audit**; no candidate is approved for bulk publication.
- Lint: **passed**.
- Production build and TypeScript: **passed**, 666 static pages generated.
- US SEO crawl: **passed**, 85 generated US pages checked.
- Internal-link audit: **passed**, 16,172 references and 0 broken targets.
- Static SEO, content-diversity, security and discovery gates: **passed**.

## Accepted catalog state

- **290 US products total**
- **71 published**
- **219 candidates**
- **17 active affiliate offers**
- **106 outdoor traditional models** in the overlapping coverage taxonomy

The three Finnleo records improve research depth and category coverage without creating public pages, rankings or affiliate links. A later publication review requires complete source-backed electrical/configuration facts and product-specific editorial copy.
