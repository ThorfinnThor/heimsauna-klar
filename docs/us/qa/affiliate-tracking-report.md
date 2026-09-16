# US affiliate target and program review

**Review date:** 16 September 2026
**Task:** L-13  
**Scope:** indexed US release, 248 catalog records, four Awin program records

## Result

The US release has seventeen manually reviewed affiliate offers. Sweat Kingdom Saunas is approved for publisher `3037577` based on operator confirmation, its program terms and exact product mappings. The remaining three Awin programs remain research candidates. Feed synchronization is disabled.

This is an evidence boundary, not an indication that the merchants do not operate affiliate programs. Public Awin merchant profiles establish that a program profile exists; they do not establish that this publisher account was accepted or that a product feed, deeplink or tracking host is available to it.

## Program review

| Program | Awin advertiser ID | Merchant | Account relationship | Tracking/deeplink evidence | Decision |
| --- | ---: | --- | --- | --- | --- |
| Sweat Kingdom Saunas | 125462 | Sweat Kingdom | `approved` | `awin1.com`, deeplink | seventeen reviewed offers active |
| Peak Saunas (US) | 118291 | Peak Saunas | `needs-account-check` | none recorded | do not create an offer |
| Sunlighten | 63394 | Sunlighten | `needs-account-check` | none recorded | do not create an offer |
| JNH Lifestyles | 101557 | JNH Lifestyles | `needs-account-check` | none recorded | do not create an offer |

The profiles and terms are recorded in `data/us/sources.json`. Merchant hosts remain candidates in `data/us/merchants.json`; they are not approved outbound destinations for an affiliate offer.

## Product coverage

The catalog contains 248 products and 248 exact configurations. Seventeen products have approved commercial mappings to Sweat Kingdom. Two hundred twenty records remain research candidates and do not receive affiliate output; the sold-out Sweat Box is public but has no offer.

Products without a reviewed offer remain non-commercial. They must not receive a price, affiliate CTA or offer-bearing Product schema until a current offer exists for the exact configuration.

## Required evidence before activation

For each advertiser that should be activated, the operator must provide or record:

1. A dated Awin account-approval record for publisher `3037577` and the advertiser ID.
2. The allowed promotion types, including whether deeplinks, product feeds and comparison content are permitted.
3. The approved tracking host and a generated link for each exact product URL.
4. The product-feed or advertiser-product identifier and the destination host.
5. Any image, price, shipping and regional restrictions required by the program.

Only after that evidence is reviewed may a configuration-level offer be added to `data/us/offers.json`. The offer must pass the existing policy checks for exact product/configuration mapping, HTTPS, advertiser ID, publisher ID, freshness, USD price scope and disclosure.

## Live-test status

No conversion or checkout test was performed. The live release should be smoke-tested by sampling the marked Sweat Kingdom links and confirming their exact merchant destinations. Every offer remains subject to the freshness and emergency-kill-switch controls in `lib/us/affiliate.ts`.

## Decision

**L-13: PARTIALLY ACCEPTED.** Sweat Kingdom is active with seventeen exact offers. Peak Saunas, Sunlighten and JNH Lifestyles remain blocked pending account evidence and exact approved targets.
