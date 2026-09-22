# US catalog maintenance process

**Status:** Draft operating process for the protected US catalog
**Owner:** Schayan Yousefian / SeitenHafen361
**Research review:** Luna
**Technical review:** Sol

The US catalog remains versioned JSON. There is no runtime database, hidden feed updater or automatic publication step. A catalog change is a pull request containing the changed records, source/evidence diff, a review report and the relevant test result.

## Review calendar

The authoritative calendar is [catalog-review-policy.json](../../data/us/catalog-review-policy.json). It defines three separate review tracks.

| Track | Cadence or trigger | Responsible review | Verification |
| --- | --- | --- | --- |
| Technical facts and source pages | 90 days after technical review | Luna | Sol |
| Offers, prices and delivery scope | 30 days after a successful check | Luna | Sol |
| Program, promotion and image rights | Every documented change | Operator | Luna |

The dates are a control mechanism, not evidence that a check has happened. A product is not considered current merely because it has a date in JSON. A reviewed or published product must have an explicit `next_review_at`; a candidate remains a research record until its first review is actually performed.

## Reproducible review command

Run the report with an explicit UTC calendar date:

```text
npm run us:catalog:review -- --as-of 2026-09-14
```

The command reads products, sources, programs, rights and publication controls and prints a JSON report. It reports missing source references, source dates older than the technical cadence, due or missing review dates, undocumented publisher approval, unapproved rights and protected publication switches. It does not edit files, promote records or enable routes.

The current catalog has 55 published products and 235 non-public candidates. One US affiliate program is documented as approved, 17 reviewed affiliate offers are active, indexing is enabled and feed synchronization remains disabled. Manufacturer-image rights are still unapproved, so current product pages remain image-free unless a separate approved asset record is added.

## Change workflow

1. Luna adds or updates the product, configuration, source and evidence records. Unknown facts remain `unknown`; they are not estimated from similar products.
2. The review command is run with the review date and its JSON output is attached to the change.
3. Sol checks schema, references, market isolation, static output, internal links, SEO protection and the DE baseline.
4. Only after the applicable operator and publication decisions may a record move from `candidate` or `draft` to `reviewed` or `published`.
5. A source failure or uncertain mapping leaves the last reviewed snapshot intact. It never removes products or creates an offer.

## Candidate publication waves

Candidate records are not promoted by changing their status in bulk. Run `npm run us:candidates:readiness -- --as-of YYYY-MM-DD` to divide them into an editorial-ready cohort, an exact-source-review cohort, an electrical-enrichment cohort and a foundational or category-specific cohort. The report uses the same strict cabin-and-kit data gate as the first indexed release. Heaters, accessories, tents and blankets remain in the category-specific cohort until their own review profile is defined.

An editorial-ready result means that editorial production may begin. It is not permission to publish. Product-specific copy, presentation QA, source review and the normal release controls still apply.

## Ownership and escalation

Schayan owns operator evidence, account approvals, rights requests and final release authorization. Luna owns source interpretation and product/configuration changes. Sol owns schema, validators, build gates, route behavior and rollback readiness. A disagreement about model identity, electrical facts, delivery scope or rights keeps the affected record at the lower status and is recorded in the pull request.

This process is prepared for the US catalog, but it is not a production go-live approval. S‑24, operator/legal readiness, approved advertiser relationships and the existing US switches remain separate gates.
