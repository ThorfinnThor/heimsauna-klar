# Heimsauna Klar (working title)

Static-first German sauna decision platform. The current slice includes a content-led homepage, a type-level sauna finder, a versioned product schema, and automated data/build checks.

## Architecture

- Next.js App Router with `output: "export"`
- static HTML/CSS/JS generated into `out/`
- editorial content and product data in checked-in JSON
- Cloudflare Workers Builds runs the data checks and creates the production export
- Cloudflare Static Assets serves the generated site; there is no runtime database or Worker script

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
- `data/products.json`: 150 verified manufacturer-sourced product records
- `data/launch-readiness.json`: machine-readable launch and indexing gates
- `data/schema/product.schema.json`: product contract

Products must not be published as verified without an official manufacturer or manual source. The validator also rejects duplicate IDs, missing core fields, invalid or future check dates, duplicate offers/sources, and verified queue entries that have no published product record.

## Affiliate link policy

Affiliate links are disabled by default. Every offer merchant and target host must exist in `data/merchants.json`. Activating an affiliate offer additionally requires an approved program in the merchant registry, a user-visible disclosure, and `sponsored nofollow noreferrer` on the outbound link. Publisher credentials and tracking secrets must never be committed; only the final approved deeplink belongs in product data.

## Deployment

The primary deployment target is the existing Cloudflare Worker project using
Static Assets. In **Settings → Build** configure:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Non-production deploy command: `npx wrangler versions upload`
- Production branch: `main`

Do not use `npx opennextjs-cloudflare build` for this repository. That command is
for the server-capable OpenNext Workers adapter and adds a second Worker bundle
after the static Next.js export. The checked-in `wrangler.toml` points Wrangler
directly at `out/` and deliberately has no Worker `main` entry point.
`npm run deploy:cloudflare` builds and uploads the static assets when a Cloudflare
login is available.

Set `NEXT_PUBLIC_SITE_URL` in the Cloudflare Pages environment to the canonical production origin, for example `https://brand.com`. Indexing is a separate launch gate: pages remain `noindex` and `robots.txt` blocks crawling until `SITE_INDEXABLE=true` is explicitly set and every required entry in `data/launch-readiness.json` is `ready`. The data check rejects an indexable build while a legal placeholder or launch blocker remains.

## Next product slice

1. Confirm the operator details, brand name and final production domain.
2. Complete the legal review and mark the corresponding launch gates as ready.
3. Apply to a suitable German partner program; map approved tracking links only after acceptance.
4. Add source-specific ingestion only after a stable feed exists; generated pull requests are preferred over direct production writes.
5. Enable indexing only after the final gate audit passes on the canonical domain.
