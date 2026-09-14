# L-17 US catalog expansion review

Date: 2026-09-14
Status: Implemented as a protected research backlog; no public product or offer was added.

## Result

`docs/us/catalog-expansion-backlog.json` now records the next source-backed US opportunities without turning a collection page or a partially documented configuration into a product record. The current protected catalog remains at ten candidate products, zero published products and zero active offers.

The first priority is four Peak models that have model-level manufacturer pages and a model reference: Rainier and Matterhorn for indoor infrared coverage, followed by Kilimanjaro and El Capitan for outdoor infrared coverage. The Sweat Kingdom Sweat Cabin is the first traditional-outdoor candidate, but its available wall heights and made-to-order choices require a stable configuration decision before import. Sunlighten portable products and the JNH outdoor collection remain taxonomy or collection candidates until exact model pages are selected.

## Guardrails

- Every backlog entry has explicit source IDs and an import gate.
- `autopublish` is false at the backlog and entry level by design.
- Candidate IDs are checked against the canonical product list so a backlog entry cannot silently become a product.
- No price, availability, affiliate offer, image asset or publication route is created by this step.
- Model pages and manuals still need a source bundle with electrical, placement, warranty and rights checks before a later import.

## Verification

- `node --test scripts/us/catalog-expansion.test.mjs`
- `npm run us:matrix:check`
- `npm run us:ci`
- `npm run build`

This is a Luna implementation step. After the next small, source-complete candidate batch is prepared, Sol should perform the acceptance review before any publication switch is considered.
