# US first-wave indexing readiness

**Review date:** 15 September 2026  
**Reviewer:** Sol  
**Decision:** Ten products pass the technical data gate and their product-specific decision copy is reviewed; zero US pages are approved for indexing yet

## First wave

The first search-launch slice is intentionally limited to ten Peak Saunas and JNH Lifestyles models. These are the models already supported by the current indoor-infrared comparison, JNH brand page and electrical planning guide. Each selected record has an exact manufacturer product page, a one-to-one configuration, documented model identity and placement, documented seated capacity and exterior dimensions, documented materials, and one electrical requirement with voltage, rated power and rated current.

| Brand | Models | Scope |
| --- | --- | --- |
| Peak Saunas | Shasta, Everest, Mini, Crown, Fuji, Patagonia | Five indoor and one outdoor infrared cabin |
| JNH Lifestyles | Tosi 1-Person, Tosi 2-Person, Tosi Red 4-Person, Arki Outdoor Duo | Three indoor and one outdoor infrared cabin |

The ten product IDs and the machine-checked criteria are stored in `docs/us/indexing-readiness.json`. The new `npm run us:indexing:plan:check` command verifies the selected records against the current product, configuration, source, editorial, trust and publication documents.

## Why indexing remains off

The ten selected product pages now include their own source-based decision copy explaining where the model fits, which documented constraints matter and which facts remain open. Sol reviewed the copy, replaced the remaining generic hero and metadata summaries, and confirmed the responsive desktop presentation. This closes the first-wave product-copy gate without making the pages public to search engines.

The US home, comparison, brand page, guide and trust pages also remain `draft`. They require a scoped editorial and operator review before their status can change. The checked-in publication switch therefore remains `indexing_enabled: false`; the sitemap and `llms.txt` continue to exclude all US routes.

Affiliate approval and manufacturer-image rights remain separate commercial controls. Their absence does not force factual editorial pages to stay out of search, provided the launch remains image-free and contains no US offers, tracking links, prices or unsupported commercial claims.

## Coverage correction

The previous coverage matrix described the early four-category pilot. It now reflects all 100 research products and all seven catalog segments. The current catalog contains meaningful cabin coverage, but the heater and accessory segments are still too thin for search publication and remain outside the first wave.

## Next handoff

The next review should concentrate on the US home, the supporting comparison, brand and guide pages, and the four launch trust pages. Product and configuration publication remains a separate release step. Sitemap membership and the indexing switch must stay closed until the complete release snapshot passes its final live-device check.
