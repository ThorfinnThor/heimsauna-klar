# S-21 launch preview integration report

**Date:** 2026-09-14  
**Decision:** technically accepted as a protected preview snapshot

S-21 integrates the L-10 dataset into the existing static US preview without opening any production surface. The snapshot contains 10 candidate products, 10 one-to-one configurations, 20 source records, 20 evidence records and 0 offers. The 23 expected routes are declared individually and remain `noindex, follow`.

## Integration correction

The generated catalog and product routes already included the four L-10 records, but the US homepage and indoor infrared comparison still described the earlier six-product research set. The copy and source references now match the ten-product snapshot. The comparison selection resolves to the eight documented indoor infrared candidates; the two outdoor candidates remain outside that comparison.

## Versioned controls

- `docs/us/launch-snapshot.json` freezes the candidate IDs, configuration IDs, content IDs, rights entries, publication switches and SHA-256 hashes of the reviewed inputs.
- `docs/us/preview-manifest.json` declares every expected protected route and its noindex state.
- `scripts/us/check-launch-snapshot.mjs` fails on input drift, missing or unexpected records, mismatched relationships, missing rights entries, offers in the protected snapshot, enabled publication switches, undeclared routes or fixture markers.
- `scripts/us/check-protected-pilot-preview.mjs` compares the actual static output with the route manifest rather than trusting a page count alone.

All ten image entries remain `not-requested` with no permission basis. No manufacturer image, offer, price, tracking link or public Product schema is emitted. Draft editorial and legal pages appear only because they are explicitly declared in the offline preview manifest; the output gate removes the complete `/us` directory before deployment.

## Verification

- `npm run us:snapshot:check`: passed
- `npm run us:preview:test`: 23/23 static US pages passed; 10 products, 10 configurations, 0 offers; no undeclared route or fixture leak
- `npm run us:test`: 106/106 passed
- `npm run us:de-baseline:check`: passed
- `npm run lint`: passed
- `npm run build`: passed; US output removed and 568 deployable DE HTML pages retained with 0 broken internal targets

## Remaining conditions

This is not a publication or affiliate approval. L-05 remains blocked because the US publisher/advertiser relationship, offer mapping, tracking destination and image rights are not documented. L-11 and L-12 must review the integrated content and rendered preview before S-22 can issue a final technical recommendation. All four US publication switches remain `false`.
