# US affiliate target and program review

**Review date:** 14 September 2026  
**Task:** L-13  
**Scope:** protected US pilot, ten candidate products, four Awin program candidates

## Result

The US pilot is not affiliate-ready. The repository contains four Awin program profiles for research, but none has a documented publisher-account approval. There are no US offers, no affiliate URLs, no approved tracking hosts and no product-to-program mappings. The four publication switches remain disabled.

This is an evidence boundary, not an indication that the merchants do not operate affiliate programs. Public Awin merchant profiles establish that a program profile exists; they do not establish that this publisher account was accepted or that a product feed, deeplink or tracking host is available to it.

## Program review

| Program | Awin advertiser ID | Merchant | Account relationship | Tracking/deeplink evidence | Decision |
| --- | ---: | --- | --- | --- | --- |
| Sweat Kingdom Saunas | 125462 | Sweat Kingdom | `needs-account-check` | none recorded | do not create an offer |
| Peak Saunas (US) | 118291 | Peak Saunas | `needs-account-check` | none recorded | do not create an offer |
| Sunlighten | 63394 | Sunlighten | `needs-account-check` | none recorded | do not create an offer |
| JNH Lifestyles | 101557 | JNH Lifestyles | `needs-account-check` | none recorded | do not create an offer |

The profiles and terms are recorded in `data/us/sources.json`. Merchant hosts remain candidates in `data/us/merchants.json`; they are not approved outbound destinations for an affiliate offer.

## Product coverage

The pilot has ten candidate products and ten exact configurations. Six are attributed to JNH Lifestyles or Peak Saunas in the product evidence, and four additional Peak candidates were added from official product pages. `data/us/mappings.json` intentionally contains zero mappings because an editorial product record is not evidence of an approved commercial relationship.

The product pages may remain in the protected research preview. They must not receive a price, affiliate CTA, affiliate disclosure tied to a live offer or public Product schema until a reviewed offer exists.

## Required evidence before activation

For each advertiser that should be activated, the operator must provide or record:

1. A dated Awin account-approval record for publisher `3037577` and the advertiser ID.
2. The allowed promotion types, including whether deeplinks, product feeds and comparison content are permitted.
3. The approved tracking host and a generated link for one exact product URL.
4. The product-feed or advertiser-product identifier and the destination host.
5. Any image, price, shipping and regional restrictions required by the program.

Only after that evidence is reviewed may a configuration-level offer be added to `data/us/offers.json`. The offer must pass the existing policy checks for exact product/configuration mapping, HTTPS, advertiser ID, publisher ID, freshness, USD price scope and disclosure.

## Live-test status

No live affiliate click or conversion test was performed. No test is claimed. A production-domain test is only appropriate after an approved relationship and a reviewed single pilot offer exist. Until then, the safe state is zero US offers and all four US publication switches set to `false`.

## Decision

**L-13: BLOCKED pending operator evidence.** The current data is valid for a protected research preview but cannot support US affiliate publication. The next actionable step is to obtain the four Awin account/program records, then rerun this review and map only the advertisers with exact, approved targets.
