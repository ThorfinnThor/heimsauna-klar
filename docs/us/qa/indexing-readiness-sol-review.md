# US first-wave indexing readiness

**Review date:** 15 September 2026  
**Reviewer:** Sol  
**Decision:** Ten products pass the technical data gate; zero US pages are approved for indexing yet

## First wave

The first search-launch slice is intentionally limited to ten Peak Saunas and JNH Lifestyles models. These are the models already supported by the current indoor-infrared comparison, JNH brand page and electrical planning guide. Each selected record has an exact manufacturer product page, a one-to-one configuration, documented model identity and placement, documented seated capacity and exterior dimensions, documented materials, and one electrical requirement with voltage, rated power and rated current.

| Brand | Models | Scope |
| --- | --- | --- |
| Peak Saunas | Shasta, Everest, Mini, Crown, Fuji, Patagonia | Five indoor and one outdoor infrared cabin |
| JNH Lifestyles | Tosi 1-Person, Tosi 2-Person, Tosi Red 4-Person, Arki Outdoor Duo | Three indoor and one outdoor infrared cabin |

The ten product IDs and the machine-checked criteria are stored in `docs/us/indexing-readiness.json`. The new `npm run us:indexing:plan:check` command verifies the selected records against the current product, configuration, source, editorial, trust and publication documents.

## Why indexing remains off

The product records are technically useful, but the current product-detail page still presents the same factual module structure for every model. That is suitable for the public research beta, not for ten indexable search landing pages. Each selected model still needs its own source-based decision copy explaining where it fits, which documented constraints matter and which facts remain open.

The US home, comparison, brand page, guide and trust pages also remain `draft`. They require a scoped editorial and operator review before their status can change. The checked-in publication switch therefore remains `indexing_enabled: false`; the sitemap and `llms.txt` continue to exclude all US routes.

Affiliate approval and manufacturer-image rights remain separate commercial controls. Their absence does not force factual editorial pages to stay out of search, provided the launch remains image-free and contains no US offers, tracking links, prices or unsupported commercial claims.

## Coverage correction

The previous coverage matrix described the early four-category pilot. It now reflects all 100 research products and all seven catalog segments. The current catalog contains meaningful cabin coverage, but the heater and accessory segments are still too thin for search publication and remain outside the first wave.

## Next handoff

Luna should prepare the ten product-specific editorial records and refresh the three supporting editorial pages for this exact launch slice. Sol should then review duplication, claims, metadata, structured data, internal links, sitemap membership and the live mobile/desktop output before the separate indexing switch is considered.
