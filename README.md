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
- `data/products.json`: six verified manufacturer-sourced product records
- `data/schema/product.schema.json`: product contract

Products must not be published as verified without at least one documented source. The validator rejects duplicate IDs and missing core fields.

## Deployment

Set `NEXT_PUBLIC_SITE_URL` in Vercel to the canonical production origin, for example `https://brand.com`. Without it, preview/local builds use a local origin and tell crawlers not to index the site.

## Next product slice

1. Confirm the brand name and production domain, then set `NEXT_PUBLIC_SITE_URL` in Vercel.
2. Reconcile the two skipped queue entries before publishing more products.
3. Select the next 10–20 real products and record source URLs plus verification dates.
4. Add source-specific ingestion as a GitHub Action that opens a pull request; do not write directly to production.
