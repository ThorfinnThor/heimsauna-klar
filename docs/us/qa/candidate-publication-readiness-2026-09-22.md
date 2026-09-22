# US candidate publication readiness — 2026-09-22

**Review owner:** Sol  
**Scope:** 262 non-public US catalog candidates  
**Decision:** Publish in reviewed waves. Do not bulk-enable all candidate routes.

## Result

The 262 records are valid research candidates, but they are not one homogeneous release batch. The existing US indexing gate requires exact, current model evidence for identity, placement, capacity, exterior dimensions, materials and the core electrical values. Every public product also needs reviewed, product-specific decision copy and a presentation check.

| Cohort | Products | Meaning | Next action |
| --- | ---: | --- | --- |
| A — editorial-ready | 27 | Strict technical gate passed with a current exact manufacturer source | Write individual decision copy, run presentation and source QA, then promote |
| B — source review | 25 | Core and electrical facts are present, but the exact current manufacturer source gate is not complete | Verify the exact model source and evidence mapping |
| C — electrical enrichment | 54 | Product, capacity, dimensions and materials are documented, but the complete electrical trio is missing | Review exact manuals or product pages without inferring values |
| D — foundational or category-specific enrichment | 156 | One or more core facts are missing, or the product needs a non-cabin review profile | Deepen the record before editorial work |

The 27 Cohort A candidates now have prepared, source-bound product copy. They still require Sol's source, presentation and release QA. The remaining 235 candidates do not yet have this copy. Changing all 262 records to `published` would create thin, repetitive pages and contradict the editorial quality rules in `AGENTS.md`.

## Cohort A

Cohort A contains six sauna cabins and 21 sauna kits:

1. Peak Saunas Rainier
2. Peak Saunas Matterhorn
3. Peak Saunas Kilimanjaro
4. Peak Saunas El Capitan
5. Almost Heaven Saunas Hillsboro 2 Person Indoor Sauna
6. Almost Heaven Saunas Pinnacle 4 Person Barrel Sauna
7. Almost Heaven Saunas Logan 1 Person Indoor Sauna
8. Almost Heaven Saunas Princeton 6 Person Barrel Sauna
9. Almost Heaven Saunas Rainelle 4 Person Indoor Sauna
10. Almost Heaven Saunas Audra 2–4 Person Canopy Barrel Sauna
11. Almost Heaven Saunas Bridgeport 6 Person Indoor Sauna
12. Almost Heaven Saunas Grandview 4–6 Person Canopy Barrel Sauna
13. Almost Heaven Saunas Titan 6 Person Indoor Sauna
14. Almost Heaven Saunas Patterson 6 Person Indoor Sauna
15. Almost Heaven Saunas Lewisburg 6–8 Person Barrel Sauna
16. Almost Heaven Saunas Grayson 4 Person Indoor Sauna
17. Almost Heaven Saunas Charleston 4 Person Canopy Barrel Sauna
18. Almost Heaven Saunas Huntington 4–6 Person Canopy Barrel Sauna
19. Almost Heaven Saunas Madison 2–3 Person Indoor Sauna
20. Sun Home Equinox
21. Sun Home Eclipse 2
22. Redwood Outdoors Garden Outdoor Sauna 8 Person
23. Redwood Outdoors Grove Outdoor Sauna 8 Person
24. Redwood Outdoors Vista Outdoor Sauna 6 Person
25. Redwood Outdoors Barrel Outdoor Sauna 6 Person
26. Redwood Outdoors Barrel Outdoor Sauna with Porch 6 Person
27. Redwood Outdoors Extra-Wide Outdoor Barrel Sauna 6 Person

## Release sequence

1. Luna prepares product-specific editorial records for Cohort A. The copy states useful model distinctions, preserves unknowns and avoids repeated page structures or stock phrases.
2. The product pages remain image-free unless an asset has documented usage rights. Missing image rights do not block a factual, image-free page.
3. Sol checks data evidence, copy quality, responsive layout, metadata, canonical output, internal links and duplicate-pattern risk.
4. Only records that pass both reviews move to `published`. Their routes and sitemap entries are released together.
5. Cohorts B and C are deepened in parallel only after the first wave is stable. Cohort D is split into cabin, kit, heater and portable-specific work because a cabin completeness rule is not appropriate for every product type.

The readiness inventory can be reproduced with:

```text
npm run us:candidates:readiness -- --as-of 2026-09-22
```
