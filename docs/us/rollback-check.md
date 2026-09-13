# US expansion rollback check

**Checked:** 2026-09-13
**Protected DE baseline:** `4a215de58a393cf5d50d21216c20af172bd92560`

## What is protected

`docs/us/de-data-baseline.json` records SHA-256 hashes for the existing German product, merchant, indexing, editorial, redirect, and security-header files. It also fixes the expected operating totals at 516 products, 306 indexable product pages, 18 merchants, and 210 active affiliate offers.

`npm run us:de-baseline:check` fails if one of those files or totals changes during the additive US work. This deliberately avoids rewriting the established German catalog into the US schema.

## Tests performed

1. The current working tree passed the full static build and all data, link, SEO, editorial-diversity, security, and discovery checks.
2. The US publication switches remained disabled. The post-build gate removed `out/us/` and found no `/us/` links in public HTML, `sitemap.xml`, or `llms.txt`.
3. Commit `4a215de58a393cf5d50d21216c20af172bd92560` was exported with `git archive` into an isolated temporary directory and rebuilt using the installed dependency tree. Its original static build passed, including 568 HTML pages, 14,933 internal references, zero broken internal targets, 306 indexable product pages, and 210 noindex product pages.

No production rollback or Cloudflare deployment was executed. Those operations remain subject to an explicit release decision.

## Recovery procedure

The safe recovery route is a normal Git revert of the US implementation commits followed by the existing Cloudflare static-assets deployment. The baseline must be checked before deployment:

```sh
npm run us:de-baseline:check
npm run build
git revert <us-implementation-commit>
npm run build
```

The revert should be pushed only after the second build passes. A destructive reset is neither needed nor part of this procedure.
