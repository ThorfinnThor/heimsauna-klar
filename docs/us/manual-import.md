# Manual US data import

The manual import path reviews a complete US data snapshot before it can replace the checked-in snapshot. It is intended for researched Luna handoffs and deliberately does not accept publication controls or editorial content.

## Candidate directory

A candidate directory contains these seven files with the same envelopes used under `data/us/`:

- `products.json`
- `configurations.json`
- `sources.json`
- `merchants.json`
- `programs.json`
- `offers.json`
- `mappings.json`

Start from a copy of the current files and make additive changes. Existing IDs cannot be removed through this tool. `publication.json` is excluded so an import cannot enable routes, indexing, affiliate links, or feed sync.

## Review

```sh
npm run us:import:review -- --input /absolute/path/to/candidate --report /tmp/us-import-review.json
```

The command validates the complete candidate bundle and reports additions, updates, removals, changed URLs, changed prices, null-value drift, checksums, and every blocking issue. It exits non-zero for a rejected candidate. It rejects, among other conditions, non-US documents, duplicate or malformed IDs, missing source/evidence references, non-USD offer prices, foreign merchant hosts, and product/configuration mismatches.

An unchanged snapshot returns `no-changes`, making repeated review idempotent.

## Apply after review

```sh
npm run us:import:review -- --input /absolute/path/to/candidate --report /tmp/us-import-review.json --apply
```

Apply is available only after the same run receives `ready` or `no-changes`. Before replacing the seven canonical files, the tool copies their prior contents to a uniquely named directory under the operating system's temporary directory. A write failure restores every file already touched during that run. Git remains the durable review and rollback history.

After an applied import, run:

```sh
npm run us:data:check
npm run us:test
npm run us:de-baseline:check
npm run build
```

Do not commit a candidate merely because the import is technically valid. Product facts and wording still require the assigned research and editorial review, and publication switches remain a separate operator decision.
