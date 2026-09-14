# US editorial review · L-08

**Review date:** 2026-09-14  
**Scope:** US homepage, comparison, brand, guide and contact research preview

## Decision

The L-08 content set is editorially ready for a protected research preview. It is not a production or indexing approval. The US publication switches remain disabled, and the output gate removes `/us/` from the deployable static output.

## Content set

| Page | Editorial purpose | Source basis | Open boundary |
| --- | --- | --- | --- |
| `/us/` | Explain the research scope and method | Six manufacturer product pages in `data/us/sources.json` | No traditional electric or wood-burning coverage in the pilot |
| `/us/compare/indoor-infrared-saunas/` | Compare the five documented indoor infrared configurations | Peak Shasta, Peak Everest and three JNH Tosi product pages | Installation clearances are not documented |
| `/us/brands/jnh-lifestyles/` | Keep four JNH configurations under exact brand identity | Three Tosi pages and the Arki Outdoor Duo page | Circuit detail is incomplete for Tosi 1- and 2-Person |
| `/us/guides/infrared-sauna-electrical-requirements/` | Explain why voltage alone is not an installation approval | Six pilot product records and their source pages | No wiring, receptacle or code advice is invented |
| `/us/contact/` | Provide a correction and source-contact path | Confirmed operator and email details | Legal/privacy publication text remains a later L-09/S-18 task |

## Editorial checks

- Copy is written for each page's purpose; the homepage, comparison, brand profile and guide use different module orders and decision angles.
- No page claims first-hand testing, product quality ranking, health benefit, delivery promise, certification, warranty or installation approval.
- Exterior dimensions, capacity, voltage, current and dedicated-circuit statements remain tied to the corresponding source records. Unknown fields are described as unresolved rather than filled by inference.
- The comparison rule is explicit and deterministic. Product links resolve to the matching configuration slug and no affiliate offer is implied.
- The homepage is stored in `content/us/home.json`; the validator rejects an empty homepage section set or unknown source references.

## Remaining conditions

Image rights, reviewed merchant offers, installation clearances, shipping scope, full trust/legal pages and the separate technical SEO release gate remain open. These conditions must be resolved before changing `routes_enabled`, `indexing_enabled`, or `affiliate_links_enabled`.
