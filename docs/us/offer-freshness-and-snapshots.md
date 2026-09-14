# US offer freshness and snapshots

## Publication policy

US offers use the shared 30-day freshness window. The last successful verification date is the only date that makes an offer current. A failed attempt must not change it.

An affiliate link is withheld when the offer is stale, unavailable, has unknown availability, contains an invalid date or claims a successful check in the future. A stale numeric price is never shown. Its public status is `Check current price` without an outbound affiliate CTA.

Finder budget comparisons apply an additional price rule. The price must be current, present, documented for the selected scope and free of excluded required components. Quote-only and incomplete offers remain non-comparable.

Product structured data does not emit `Offer` markup in the current pilot. This prevents a second price path from diverging from the approved snapshot.

## Snapshot contract

The promotion command accepts a reviewed JSON file with an import envelope:

```json
{
  "schema_version": 1,
  "market": "US",
  "snapshot": {
    "attempt_id": "awin-us-2026-09-14",
    "attempted_at": "2026-09-14",
    "source_status": "succeeded",
    "complete": true
  },
  "offers": []
}
```

Review without writing:

```sh
npm run us:offers:promote -- --input /absolute/path/to/snapshot.json --report /absolute/path/to/report.json
```

Add `--apply` only after reviewing the report. Promotion is rejected when the source failed, the response is incomplete, validation fails, a successful-check date lies after the attempt, or an existing offer ID would disappear. A successful write replaces only `data/us/offers.json` through an atomic rename and retains a recovery copy in a temporary backup directory reported by the command.

The command never edits products, configurations, sources, merchants or programs. Full-bundle manual imports remain subject to their separate additive validation and backup policy.
