# US trust-page integration review

Review date: 2026-09-14  
Scope: technical portion of S-18  
Status: Preview integration complete; production approval remains open.

## Integrated routes

- `/us/contact/`
- `/us/methodology/`
- `/us/affiliate-disclosure/`
- `/us/privacy/`

Each route reads its content from `content/us/legal.json`, uses US metadata with a self-referential canonical and renders through the shared trust-page component. The US footer includes only trust pages available in the current publication context. Drafts are visible in the offline research preview and disappear from navigation when drafts are excluded.

## Safety result

The protected preview generated 19 US pages. All 19 carried `noindex, follow`, the SEO crawl found no broken US link, and no US URL entered the sitemap or `llms.txt`. The normal output gate removed the complete `out/us` directory because US routes remain disabled.

The affiliate disclosure remains `draft`, so it cannot satisfy the affiliate-output approval gate. No consent manager, analytics code, tracking event, form endpoint or account feature was added.

## Verification

- `npm run us:preview:test`: 19/19 preview pages passed and preview output was removed
- `npm run us:test`: 103/103 passed
- `npm run lint`: passed
- `npm run build`: passed
- DE regression: 568 HTML pages, 14,923 internal references and 0 broken targets

## Remaining S-18 work

Production publication requires the operator/legal decision recorded as O-03. Cloudflare account settings, GitHub log retention, Awin US program behavior and mailbox routing still need confirmation. After that review, approved text statuses and required user controls can be changed in one explicit release step. This integration does not infer that consent or an opt-out is or is not required.
