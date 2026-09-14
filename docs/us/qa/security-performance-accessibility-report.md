# US security, performance and accessibility review

Review date: 2026-09-14  
Scope: S-19 protected US pilot  
Status: Static and browser-verifiable acceptance complete; production browser traces and assistive-technology tests remain named release checks.

## Changes made

- The US route-group layout now owns the site header, a single main landmark and the footer. Every generated US page therefore has the same valid landmark order.
- A keyboard-visible skip link targets the focusable main landmark.
- Links, controls and disclosure summaries have a consistent visible focus indicator. Reduced-motion preferences also suppress transitions and animations.
- The decorative brand icon uses a CSS background instead of Next Image markup. This removed the generated inline style that conflicted with the site's `style-src-attr 'none'` policy.
- US metadata now declares the existing favicon and Apple touch icon assets.
- The small accent used on dark result panels is explicitly defined and passes the normal-text contrast threshold.
- Mobile finder result headings no longer hyphenate words.
- The Cloudflare Workers compatibility date is now `2026-09-14`.

## Automated security result

The protected preview now runs `scripts/us/check-static-quality.mjs` before deleting `out/us`. The check covers all 19 generated US pages and fails on:

- a missing or duplicate main landmark or H1;
- missing skip-link structure, positive tabindex values or unlabeled form controls;
- buttons without an explicit type;
- inline event handlers or inline styles that conflict with the CSP;
- third-party scripts, images, stylesheets, iframes or external form actions;
- unsafe `target="_blank"` links;
- tracked local environment or `.dev.vars` files;
- relaxed security headers, an unexpected redirect or a runtime Worker entry point;
- a stale or future Workers compatibility date;
- enabled US release flags during protected preview testing;
- asset or compressed HTML regressions beyond the recorded pilot ceilings.

The existing data-flow tests also passed. They verify that the public client has no hidden collection or third-party embeds, Awin ingestion reads its credential from a secret and persisted reports are sanitized. The only static redirect remains the fixed `/ → /de/` redirect.

## Performance baseline

Measurements are compressed static-file sizes referenced by the generated pages. They are deterministic regression indicators, not Core Web Vitals.

| Measurement | Before, commit 41485f3 | After S-19 | Change |
| --- | ---: | ---: | ---: |
| Heaviest route, `/us/sauna-finder/` JS and CSS | 202,503 B | 197,024 B | −5,479 B |
| Largest JavaScript chunk | 66,252 B | 65,812 B | −440 B |
| Largest compressed HTML document | 6,886 B | 6,971 B | +85 B |

The automated ceilings are 225,000 compressed bytes per route for referenced JS and CSS, 75,000 compressed bytes per JavaScript chunk and 10,000 compressed bytes per HTML page. They give the measured pilot a limited allowance while catching material regressions.

The deployment remains a static-assets-only Cloudflare Worker with no `main` runtime entry point. This matches Cloudflare's static asset model and avoids an application server for the current site.

## Browser checks

The protected preview was served locally from the generated `out` directory.

- Desktop at 1440 × 900: US home rendered without horizontal overflow; navigation, preview notice, hero and source sections remained legible.
- Keyboard: the first Tab stop exposed “Skip to main content”; Enter moved focus to `#main-content`.
- Mobile at 390 × 844: the US finder and Peak Saunas Everest product page rendered in a single-column layout without clipped controls or horizontal overflow.
- Finder core path: placement `indoor` and minimum seated capacity `2` submitted successfully and returned 3 known matches without relaxing the submitted criteria.
- The accessibility tree exposed labelled select, number and checkbox controls, one H1 and one main landmark.

## Explicitly unmeasured

- Chrome DevTools/Lighthouse traces and Core Web Vitals were not captured because the required Chrome DevTools MCP service was unavailable in this session. Static transfer size is not presented as a substitute.
- VoiceOver, NVDA and other screen-reader behavior was not tested with the actual assistive technology.
- A physical iOS or Android device, throttled mobile network and production Cloudflare cache path were not tested.
- US production pages remain disabled and no production US URL was measured.

These checks belong in the final release/device pass after the US publication prerequisites are approved. They do not block completion of the repository-verifiable portion of S-19, and they must not be reported as completed.

## References

- Cloudflare Workers best practices: https://developers.cloudflare.com/workers/best-practices/workers-best-practices/
- Cloudflare static assets: https://developers.cloudflare.com/workers/static-assets/
- Cloudflare compatibility dates: https://developers.cloudflare.com/workers/configuration/compatibility-dates/
