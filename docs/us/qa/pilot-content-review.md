# US pilot content review

**Review owner:** Luna  
**Review date:** 2026-09-13  
**Scope:** static US research preview, ten candidate products and the end-to-end finder interaction

## Decision

**Accepted with conditions.** The finder logic and the English labels describe the current evidence faithfully. The pilot is not a production launch approval. US routes, indexing, feed sync and affiliate links remain disabled while the offer, rights and editorial gates are open.

## Evidence reviewed

The review used the ten candidate products and their ten one-to-one configurations in `data/us/products.json` and `data/us/configurations.json`. Source records are linked in `data/us/sources.json`.

| Product | Documented scope | Key documented facts | Open facts that remain open |
| --- | --- | --- | --- |
| Peak Saunas Shasta | Indoor, infrared, 1 person | 42 × 40 × 75 in; 120 V, 15 A, 1,800 W | installation clearances, frequency, phase, shipping details, SKU |
| Peak Saunas Everest | Indoor, infrared, 2 people | 53 × 44 × 75 in; 120 V, 20 A, 2,050 W; dedicated circuit documented | installation clearances, frequency, phase, shipping details, SKU |
| JNH Lifestyles Tosi 1-Person | Indoor, infrared, 1 person | 35.5 × 35.5 × 75 in; 120 V, 1,320 W; 15 A rated current | required circuit, dedicated circuit, installation clearances, frequency, phase, shipping details, SKU |
| JNH Lifestyles Tosi 2-Person | Indoor, infrared, 2 people | 47.3 × 39.5 × 75 in; 120 V, 1,540 W | required circuit, dedicated circuit, installation clearances, frequency, phase, shipping details, SKU |
| JNH Lifestyles Tosi Red 4-Person | Indoor, infrared, 4 people | 70.9 × 47.3 × 75 in; 120 V, 1,980 W, 20 A; dedicated circuit documented | installation clearances, frequency, phase, shipping details, SKU |
| JNH Lifestyles Arki Outdoor Duo | Outdoor, infrared, 2 people | 55.25 × 47.25 × 77.5 in; 120 V, 2,350 W, 20 A; dedicated circuit documented | installation clearances, frequency, phase, shipping details, SKU |

The dimensions are exterior dimensions unless the page explicitly labels another measurement. No source was used to infer a missing clearance, circuit rating, certification, warranty, shipping package or price.

## Finder scenarios

The following scenarios were executed against the real pilot records with `asOf = 2026-09-13`.

| Query | Result | Interpretation |
| --- | --- | --- |
| Indoor + infrared + 2 people + electric 120 V | 5 known: Crown, Everest, Fuji, Tosi 2-Person, Tosi Red 4-Person; 5 excluded | Capacity, placement and the documented 120 V option agree. No claim about installation approval is made. |
| Same query plus 100 × 100 × 100 in room envelope | 0 known; 5 need verification; 5 excluded | Cabinet dimensions fit the entered envelope, but the records do not document installation clearances. |
| Indoor + infrared + 2 people + electric 240 V | 0 known; 0 need verification; 10 excluded | No indoor pilot configuration documents a 240 V option. |
| Outdoor + infrared + 2 people + electric 120 V | 1 known: Arki Outdoor Duo; 9 excluded | Placement is treated as a hard criterion. |

The automated assertions for these cases live in `scripts/us/finder.test.mjs`. The URL state tests also confirm that partial dimensions are discarded rather than silently treated as a complete room constraint, and that back/forward state is encoded in the URL.

## Copy and interaction findings

- “Documented” and “Needs verification” are used for evidence state, not as a ranking or quality claim.
- The finder explicitly says that a voltage match is not electrical approval and asks the user to confirm the manual, circuit, receptacle and local requirements with a qualified professional.
- The results separate known matches, unresolved records and excluded records. There is no hidden relaxation of a hard criterion.
- The product page uses “View documented configuration” and does not show a purchase CTA when no exact offer exists.
- The current pilot has **zero reviewed US offers**, so it has no price comparison and no affiliate destination to validate.
- The US catalog and product routes remain research-only. The publication gate removes them from the production static output, and metadata remains noindex.

## Conditions before publication

1. Obtain reviewable offer records for any product that should display a price or merchant CTA. Each offer must identify the exact configuration, scope, availability, currency and freshness.
2. Obtain image-use rights or use neutral, owned assets. The existing rights register remains `not-requested` for the ten pilot models.
3. Source installation clearances, shipping scope and any electrical details needed for a concrete installation claim. Unknown values must remain unknown.
4. Complete the distinct English editorial pages in the content manifest and run the editorial, link, security and output gates before enabling routes or indexing.

**Recommendation:** keep the ten records as a research pilot. Do not expand the public US catalog or activate affiliate links until the conditions above are documented and the later Sol technical release gate is complete.
