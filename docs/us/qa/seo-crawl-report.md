# US technical SEO crawl report

Run date: 2026-09-14
Command: `npm run build`

## Result

The pre-publication crawl checked 16 statically generated US research pages before the output gate removed `/out/us`.

- Language declaration: all checked pages use `en-US`.
- Canonicals: all checked pages use their own absolute `/us/` URL; no US-to-DE canonical was found.
- Robots: research pages remain `noindex, follow`.
- Sitemap: zero US routes are discoverable while publication controls are closed.
- `llms.txt`: no US discovery section is exposed while the sitemap set is empty.
- Internal links: no unresolved US target remained after removing a premature `/us/about/` author link.
- Structured data: JSON parses successfully and the crawl rejects unverified ratings, reviews, GTINs, return policies and shipping details.
- `hreflang`: no pair is emitted before the editorial equivalence review; the crawl requires reciprocity for future pairs.

The production output gate then removed the generated US directory and confirmed that no US link remained in public HTML or discovery files. This report verifies the technical safeguards only. It does not approve the US content or open publication.
