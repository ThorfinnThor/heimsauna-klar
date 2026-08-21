# Heimsauna Klar (working title)

Static-first German sauna decision platform. The current slice includes a content-led homepage, a type-level sauna finder, a versioned product schema, and automated data/build checks.

## Architecture

- Next.js App Router with `output: "export"`
- static HTML/CSS/JS generated into `out/`
- editorial content and product data in checked-in JSON
- the Vercel build runs the data checks and creates the production export
- Vercel serves the generated site; there is no runtime database

This keeps the early product simple and reviewable. There is currently no scheduled ingestion and therefore no GitHub Actions usage. An ingestion workflow should only be added once a real manufacturer or merchant feed has been selected. Generated pull requests are preferred over silent production writes so price and specification changes remain reviewable.

## Commands

```bash
npm install
npm run dev
npm run data:check
npm run build
```

## Content and data

- `content/de/home.json`: German homepage copy
- `data/sauna-archetypes.json`: type-level finder data
- `data/products.json`: 29 verified manufacturer-sourced product records
- `data/schema/product.schema.json`: product contract

Products must not be published as verified without an official manufacturer or manual source. The validator also rejects duplicate IDs, missing core fields, invalid or future check dates, duplicate offers/sources, and verified queue entries that have no published product record.

## Affiliate link policy

Affiliate links are disabled by default. Every offer merchant and target host must exist in `data/merchants.json`. Activating an affiliate offer additionally requires an approved program in the merchant registry, a user-visible disclosure, and `sponsored nofollow noreferrer` on the outbound link. Publisher credentials and tracking secrets must never be committed; only the final approved deeplink belongs in product data.

## Deployment

Set `NEXT_PUBLIC_SITE_URL` in Vercel to the canonical production origin, for example `https://brand.com`. Indexing is a separate launch gate: pages remain `noindex` and `robots.txt` blocks crawling until `SITE_INDEXABLE=true` is explicitly set. Only enable that flag after the legal page, brand and canonical domain are final.

## Next product slice

1. Confirm the operator details, brand name and final production domain.
2. Review price semantics for configurable manufacturer pages and keep `from` separate from a selected configuration price.
3. Add category filters and editorial grouping once the catalog grows beyond the current static list.
4. Add source-specific ingestion only after a stable feed exists; generated pull requests are preferred over direct production writes.
